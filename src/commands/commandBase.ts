/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { MultiStepHandler } from '../step/multiStepHandler';
import { ICommandOptions } from '../util/commandOptions';
import { InputFlowAction } from '../util/InputFlowAction';
import { ResultBox } from '../util/resultBox';
import { TimeConverter } from '../util/timeConverter';

abstract class CommandBase implements vscode.Disposable {

    protected _timeConverter: TimeConverter;
    protected _disposables: vscode.Disposable[] = [];
    protected _stepHandler: MultiStepHandler;
    protected _resultBox: ResultBox;

    protected _insertConvertedTime: boolean;
    protected _hideResultViewOnEnter: boolean;
    protected _ignoreFocusOut: boolean;

    private _readInputFromClipboard: boolean;
    private _writeToClipboard: boolean;

    public constructor(context: vscode.ExtensionContext, timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;

        this._resultBox = new ResultBox({
            iconPath: {
                dark: vscode.Uri.file(context.asAbsolutePath('resources/pencil_dark.svg')),
                light: vscode.Uri.file(context.asAbsolutePath('resources/pencil_light.svg'))
            },
            tooltip: 'Insert Result'
        });

        this._insertConvertedTime = this.getConfigParameter('insertConvertedTime');
        this._ignoreFocusOut = this.getConfigParameter('ignoreFocusOut');
        this._hideResultViewOnEnter = this.getConfigParameter('hideResultViewOnEnter');
        this._readInputFromClipboard = this.getConfigParameter('readInputFromClipboard');
        this._writeToClipboard = this.getConfigParameter('writeResultToClipboard');

        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.insertConvertedTime')) {
                this._insertConvertedTime = this.getConfigParameter('insertConvertedTime');
            } else if (changedEvent.affectsConfiguration('timing.ignoreFocusOut')) {
                this._ignoreFocusOut = this.getConfigParameter('ignoreFocusOut');
            } else if (changedEvent.affectsConfiguration('timing.hideResultViewOnEnter')) {
                this._hideResultViewOnEnter = this.getConfigParameter('hideResultViewOnEnter');
            } else if (changedEvent.affectsConfiguration('timing.clipboard.readEnabled')) {
                this._readInputFromClipboard = this.getConfigParameter('clipboard.readEnabled');
            } else if (changedEvent.affectsConfiguration('timing.clipboard.writeEnabled')) {
                this._writeToClipboard = this.getConfigParameter('clipboard.writeEnabled');
            }
        }, this, this._disposables);
    }

    public abstract execute(options?: ICommandOptions): void;

    public dispose() {
        this._disposables.forEach((disposable) => {
            disposable.dispose();
        });
    }

    /***
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

    private getConfigParameter<T>(configName: string): T {
        return vscode.workspace.getConfiguration('timing')
            .get<T>(configName);
    }
}

export { CommandBase };
