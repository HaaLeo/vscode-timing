/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { Constants } from './constants';
import { TimeConverter } from './timeConverter';

class DurationHoverProvider implements vscode.HoverProvider, vscode.Disposable {

    private _timeConverter: TimeConverter;

    private _disposables: vscode.Disposable[];

    private _sourceUnit: string;
    private _enabled: boolean;
    private _useISOTargetFormat: boolean;

    constructor(timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;

        this._enabled = this.getConfigParameter('enabled', true);
        this._sourceUnit = this.getConfigParameter('sourceUnit', 'ms');
        this._useISOTargetFormat = this.getConfigParameter('useISOTargetFormat', false);
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.hoverDuration.sourceUnit')) {
                this._sourceUnit = this.getConfigParameter('sourceUnit', 'ms');
            } else if (changedEvent.affectsConfiguration('timing.hoverDuration.enabled')) {
                this._enabled = this.getConfigParameter('enabled', true);
            } else if (changedEvent.affectsConfiguration('timing.hoverDuration.useISOTargetFormat')) {
                this._useISOTargetFormat = this.getConfigParameter('useISOTargetFormat', false);
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
                let prefix = '*Epoch Unit*: `';

                // Is the feature enabled?
                if (this._enabled) {
                    switch (this._sourceUnit) {
                        case Constants.SECONDS:
                        case Constants.MILLISECONDS:
                        case Constants.NANOSECONDS:
                            break;
                        default:
                            this._sourceUnit = 'ms';
                            break;
                    }
                    prefix += this._sourceUnit + '`  \n';

                    let duration: string;
                    if (this._useISOTargetFormat) {
                        duration = this._timeConverter.epochToISODuration(hoveredWord, this._sourceUnit);
                    } else {
                        duration = this._timeConverter.epochToReadableDuration(hoveredWord, this._sourceUnit);
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

    private getConfigParameter<T>(configName: string, defaultValue: T): T {
        return vscode.workspace.getConfiguration('timing.hoverDuration')
            .get<T>(configName, defaultValue);
    }
}

export { DurationHoverProvider };
