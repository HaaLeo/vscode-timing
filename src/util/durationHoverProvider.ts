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

class DurationHoverProvider implements vscode.HoverProvider, vscode.Disposable {

    private _timeConverter: TimeConverter;

    private _disposables: vscode.Disposable[];

    private _sourceUnit: string;
    private _enabled: boolean;
    private _useISOTargetFormat: boolean;

    constructor(timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;

        this.updateEnabled();
        this.updateSourceUnit();
        this.updateUseISOTargetFormat();
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.hoverDuration.sourceUnit')) {
                this.updateSourceUnit();
            } else if (changedEvent.affectsConfiguration('timing.hoverDuration.enabled')) {
                this.updateEnabled();
            } else if (changedEvent.affectsConfiguration('timing.hoverDuration.useISOTargetFormat')) {
                this.updateUseISOTargetFormat();
            }
        }, this, this._disposables);
    }

    public provideHover(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        vscode.ProviderResult<vscode.Hover> {

        let result: vscode.Hover;
        const timeRange = document.getWordRangeAtPosition(position, new RegExp('\\d+'));

        if (timeRange !== undefined) {
            const hoveredWord = document.getText(timeRange);
            if (this._timeConverter.isValidEpoch(hoveredWord)) {
                let input: InputDefinition;
                let prefix = '*Epoch Unit*: `';

                // Is the feature enabled?
                if (this._enabled) {
                    switch (this._sourceUnit) {
                        case 's':
                            input = new InputDefinition(hoveredWord, 's');
                            break;
                        case 'ms':
                            input = new InputDefinition(hoveredWord, 'ms');
                            break;
                        case 'ns':
                            input = new InputDefinition(hoveredWord, 'ns');
                            break;
                        default:
                            input = new InputDefinition(hoveredWord, 'ms');
                            break;
                    }
                    prefix += input.originalUnit + '`  \n';

                    let duration: string;
                    if (this._useISOTargetFormat) {
                        duration = this._timeConverter.epochToISODuration(input.inputAsMs);
                    } else {
                        duration = this._timeConverter.epochToReadableDuration(input.inputAsMs);
                    }

                    result = new vscode.Hover(prefix + '*Duration*: `' + duration + '`', timeRange);
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

    private updateSourceUnit(): void {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration')
            .get<string>('sourceUnit', 'ms');

        this._sourceUnit = config;
    }

    private updateEnabled(): void {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration')
            .get<boolean>('enabled', true);

        this._enabled = config;
    }

    private updateUseISOTargetFormat(): void {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration')
            .get<boolean>('useISOTargetFormat', false);

        this._useISOTargetFormat = config;
    }
}

export { DurationHoverProvider };
