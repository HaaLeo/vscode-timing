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
import { ICommandOptions } from './commandOptions';

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

    public abstract execute(options?: ICommandOptions): void;

    public dispose() {
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
            return activeEditor.edit((editBuilder) => {
                editBuilder.replace(activeEditor.selection, insertion);
            });
        }
    }

    protected async internalExecute(action: InputFlowAction, conversionName: string, rawInput: string)
        : Promise<{
            conversionResult: string,
            stepHandlerResult: string[],
            showResultBox: boolean
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

            stepHandlerResult.forEach((element) => {
                if (!element) {
                    abort = true;
                }
            });
        } else {
            stepHandlerResult = [];
        }

        if (!abort) {

            conversionResult = this._timeConverter[conversionName](...stepHandlerResult);

            if (this._insertConvertedTime) {
                inserted = await this.insert(conversionResult);
            }

            if (this._writeToClipboard) {
                await vscode.env.clipboard.writeText(conversionResult);
                vscode.window.showInformationMessage('"' + conversionResult + '" was copied to the clipboard.');
                wroteToClipboard = true;
            }
        }
        return {
            conversionResult,
            stepHandlerResult,
            showResultBox: !inserted && !wroteToClipboard && Boolean(conversionResult)
        };
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
}

export { CommandBase };
