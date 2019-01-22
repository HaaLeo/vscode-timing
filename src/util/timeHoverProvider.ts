/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { InputDefinition } from './inputDefinition';
import { TimeConverter } from './timeConverter';

class TimeHoverProvider implements vscode.HoverProvider, vscode.Disposable {

    private _timeConverter: TimeConverter;

    private _disposables: vscode.Disposable[];

    private _hoverTargetFormat: string;

    constructor(timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;

        this.updateHoverTargetFormat();
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.hoverTargetFormat')) { // todo show deprecation message
                this.updateHoverTargetFormat();
            }
        }, this, this._disposables);
    }

    public provideHover(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        vscode.ProviderResult<vscode.Hover> {
        const timeRange = document.getWordRangeAtPosition(position, new RegExp('\\d+'));
        let result: vscode.Hover;
        if (timeRange !== undefined) {
            const hoveredWord = document.getText(timeRange);
            if (this._timeConverter.isValidEpoch(hoveredWord)) {
                const input = new InputDefinition(hoveredWord);
                const prefix = '*Epoch Unit*: `' + input.originalUnit + '`  \n';

                if (this._hoverTargetFormat === 'utc') {
                    const utc = this._timeConverter.epochToIsoUtc(input.inputAsMs.toString());
                    result = new vscode.Hover(prefix + '*UTC*: `' + utc + '`');
                } else if (this._hoverTargetFormat === 'local') {
                    const local = this._timeConverter.epochToIsoLocal(input.inputAsMs.toString());
                    result = new vscode.Hover(prefix + '*Local*: `' + local + '`');
                } else if (this._hoverTargetFormat === 'disable') {
                    result = undefined;
                } else if (this._hoverTargetFormat) {
                    const custom = this._timeConverter.epochToCustom(
                        input.inputAsMs.toString(),
                        this._hoverTargetFormat);
                    result = new vscode.Hover(prefix + '*Custom*: `' + custom + '`', timeRange);
                } else {
                    result = undefined;
                }
            }
        }

        return result;
    }

    public dispose(): void {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

    private updateHoverTargetFormat(): void {
        const config = vscode.workspace.getConfiguration('timing')
            .get('hoverTargetFormat', 'utc');

        if (typeof (config) === 'string') {
            this._hoverTargetFormat = config;
        }
    }
}

export { TimeHoverProvider };
