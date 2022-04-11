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
    protected async getPreInput(): Promise<string[]> {
        let result = this.getSelection();

        if (!result && this._readInputFromClipboard) {
            result = [await vscode.env.clipboard.readText()];
        }

        return result;
    }

    protected insert(insertions: string[]): Thenable<boolean> {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            return activeEditor.edit(editBuilder => insertions.map((insertion, index) =>
                editBuilder.replace(activeEditor.selections.filter(sel => !sel.isEmpty)[index], insertion)
            ));
        }
    }


    protected async internalExecute(action: InputFlowAction, conversionName: string, rawInput: any): Promise<{
        conversionResult: string;
        stepHandlerResult: string[];
        showResultBox: boolean;
    }> {

        let stepHandlerResult: string[];
        let conversionResults: string[];
        let conversionResult: string;
        let inserted = false;
        let wroteToClipboard = false;
        let abort = false;

        if (this._stepHandler) {
            if (action === InputFlowAction.Back) {
                stepHandlerResult = await this._stepHandler.run(this._ignoreFocusOut, rawInput[0] as string, -1);
            } else {
                stepHandlerResult = await this._stepHandler.run(this._ignoreFocusOut, rawInput[0] as string);
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
            const skipIndex = this._stepHandler.steps.findIndex(step => step.skip);
            let results: string[][] = [];
            if (skipIndex > -1 && rawInput.length > 1) {
                results = rawInput.map(input => {
                    const tempRes = [...stepHandlerResult];
                    tempRes[skipIndex] = input;
                    return tempRes;
                });
            } else {
                results = [stepHandlerResult];
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            conversionResults = results.map(res => this._timeConverter[conversionName](...res) as string);
            conversionResult = conversionResults[0];

            if (this._insertConvertedTime) {
                inserted = await this.insert(conversionResults);
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

    private getSelection(): string[] | undefined {
        let result: string[];
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            result = activeEditor.selections
                .filter(selection => !selection.isEmpty)
                .map(selection => activeEditor.document.getText(selection));
        }

        return result;
    }

    public abstract execute(options?: ICommandOptions): void;
}

export { CommandBase };
