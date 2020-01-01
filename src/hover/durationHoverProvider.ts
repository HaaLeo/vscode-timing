/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { ConfigHelper } from '../util/configHelper';
import { Constants } from '../util/constants';
import { TimeConverter } from '../util/timeConverter';

class DurationHoverProvider implements vscode.HoverProvider, vscode.Disposable {

    private _sourceUnit: string;
    private _enabled: boolean;
    private _useISOTargetFormat: boolean;

    public constructor(private _timeConverter: TimeConverter, private _configHelper: ConfigHelper) {

        this._configHelper.subscribeToConfig<boolean>('timing.hoverDuration.enabled', configValue => this._enabled = configValue, this);
        this._configHelper.subscribeToConfig<string>('timing.hoverDuration.sourceUnit', configValue => this._sourceUnit = configValue, this);
        this._configHelper.subscribeToConfig<boolean>('timing.hoverDuration.useISOTargetFormat', configValue => this._useISOTargetFormat = configValue, this);
    }

    public provideHover(
        document: vscode.TextDocument, position: vscode.Position):
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
        this._configHelper.dispose();
    }
}

export { DurationHoverProvider };
