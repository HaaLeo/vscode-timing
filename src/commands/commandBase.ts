/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { MultiStepHandler } from '../step/multiStepHandler';
import { ConfigHelper } from '../util/configHelper';
import { InputFlowAction } from '../util/inputFlowAction';
import { ResultBox } from '../util/resultBox';
import { TimeConverter } from '../util/timeConverter';

abstract class CommandBase implements vscode.Disposable {

    protected _disposables: vscode.Disposable[] = [];
    protected _stepHandler: MultiStepHandler;
    protected _resultBox: ResultBox;

    protected _insertConvertedTime: boolean;
    protected _hideResultViewOnEnter: boolean;
    protected _ignoreFocusOut: boolean;

    protected _readInputFromClipboard: boolean;
    protected _writeToClipboard: boolean;

    public constructor(
        context: vscode.ExtensionContext,
        protected _timeConverter: TimeConverter,
        protected _configHelper: ConfigHelper) {

        this._resultBox = new ResultBox({
            iconPath: {
                dark: vscode.Uri.file(context.asAbsolutePath('resources/dark/insert.svg')),
                light: vscode.Uri.file(context.asAbsolutePath('resources/light/insert.svg'))
            },
            tooltip: 'Insert Result'
        });

        this._configHelper.subscribeToConfig('timing.insertConvertedTime', (value: boolean) => this._insertConvertedTime = value, this);
        this._configHelper.subscribeToConfig('timing.ignoreFocusOut', (value: boolean) => this._ignoreFocusOut = value, this);
        this._configHelper.subscribeToConfig('timing.hideResultViewOnEnter', (value: boolean) => this._hideResultViewOnEnter = value, this);
        this._configHelper.subscribeToConfig('timing.clipboard.readingEnabled', (value: boolean) => this._readInputFromClipboard = value, this);
        this._configHelper.subscribeToConfig('timing.clipboard.writingEnabled', (value: boolean) => this._writeToClipboard = value, this);
    }


    public dispose(): void {
        this._configHelper.dispose();
    }

    /**
     * Get the pre input. Either from the editors selection or from the clipboard.
     */
    protected async getPreInput(): Promise<string> {
        let result = this.getSelection();

        if (!result && this._readInputFromClipboard) {
            result = await vscode.env.clipboard.readText();
        }

        return result;
    }

    protected insert(insertion: string): Thenable<boolean> {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            return activeEditor.edit(editBuilder => {
                editBuilder.replace(activeEditor.selection, insertion);
            });
        }
    }

    protected async internalExecute(action: InputFlowAction, conversionName: string, rawInput: string): Promise<{
        conversionResult: string;
        stepHandlerResult: string[];
        showResultBox: boolean;
    }> {

        let stepHandlerResult: string[];
        let conversionResult: string;
        let inserted = false;
        let wroteToClipboard = false;
        let abort = false;

        if (this._stepHandler) {
            if (action === InputFlowAction.Back) {
                stepHandlerResult = await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                stepHandlerResult = await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            abort = stepHandlerResult.length === 0 ? true : false;

            stepHandlerResult.forEach(element => {
                if (!element) {
                    abort = true;
                }
            });
        } else {
            stepHandlerResult = [];
        }

        if (!abort) {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            conversionResult = this._timeConverter[conversionName](...stepHandlerResult) as string;

            if (this._insertConvertedTime) {
                inserted = await this.insertIntoAllSelections(conversionName, stepHandlerResult, conversionResult);
            }

            if (this._writeToClipboard) {
                await vscode.env.clipboard.writeText(conversionResult);
                void vscode.window.showInformationMessage('"' + conversionResult + '" was copied to the clipboard.');
                wroteToClipboard = true;
            }
        }
        return {
            conversionResult,
            stepHandlerResult,
            showResultBox: !inserted && !wroteToClipboard && Boolean(conversionResult)
        };
    }

    /**
     * Replace every selection of the active editor with a converted time.
     * The primary selection is replaced with `conversionResult`.
     * Every other selection containing a valid input is converted on its own using the same options (e.g. formats).
     * Other selections that are empty or contain an invalid input are left untouched and reported to the user.
     * For commands without an input (e.g. _now_) every selection is replaced with `conversionResult`.
     * @param conversionName The name of the `TimeConverter` function to use.
     * @param stepHandlerResult The step results that were used to compute `conversionResult`.
     * @param conversionResult The conversion result of the primary selection.
     * @returns A promise indicating whether the edit was applied.
     */
    private async insertIntoAllSelections(
        conversionName: string,
        stepHandlerResult: string[],
        conversionResult: string): Promise<boolean> {

        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor === undefined) {
            return false;
        }

        let skipped = 0;
        const replacements: { selection: vscode.Selection; text: string }[] = [];
        activeEditor.selections.forEach((selection, index) => {
            // The primary selection is always at index 0
            if (index === 0 || !this._stepHandler?.hasInputStep) {
                replacements.push({ selection, text: conversionResult });
                return;
            }

            const args = this._stepHandler.replaceInput(stepHandlerResult, activeEditor.document.getText(selection));
            let text: string;
            if (args) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    text = this._timeConverter[conversionName](...args) as string;
                } catch {
                    text = undefined;
                }
            }

            if (text) {
                replacements.push({ selection, text });
            } else {
                skipped++;
            }
        });

        const result = await activeEditor.edit(editBuilder => {
            replacements.forEach(replacement => editBuilder.replace(replacement.selection, replacement.text));
        });

        if (skipped > 0) {
            void vscode.window.showWarningMessage(
                `${skipped} selection(s) could not be converted because they are empty or do not contain a valid input.`);
        }

        return result;
    }

    private getSelection(): string | undefined {
        let result: string;
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            const activeSelection = activeEditor.selection;
            if (!activeSelection.isEmpty) {
                result = activeEditor.document.getText(activeSelection);
            }
        }

        return result;
    }

    public abstract execute(options?: ICommandOptions): void;
}

export { CommandBase };
