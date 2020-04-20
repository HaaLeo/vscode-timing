/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { ConfigHelper } from '../util/configHelper';
import { InputDefinition } from '../util/inputDefinition';
import { TimeConverter } from '../util/timeConverter';

class TimestampHoverProvider implements vscode.HoverProvider, vscode.Disposable {

    private _targetFormats: string[] | ICustomHoverFormat[];
    private _enabled: boolean;

    public constructor(private _timeConverter: TimeConverter, private _configHelper: ConfigHelper) {

        _configHelper.subscribeToConfig('timing.hoverTimestamp.enabled', (value: boolean) => this._enabled = value, this);
        _configHelper.subscribeToConfig('timing.hoverTimestamp.targetFormat', this.updateTimestampTargetFormat, this);
    }

    public provideHover(
        document: vscode.TextDocument, position: vscode.Position):
        vscode.ProviderResult<vscode.Hover> {

        const timeRange = document.getWordRangeAtPosition(position, new RegExp('\\d+'));
        let result: vscode.Hover;
        if (timeRange !== undefined) {
            const hoveredWord = document.getText(timeRange);
            if (this._timeConverter.isValidEpoch(hoveredWord)) {
                const input = new InputDefinition(hoveredWord);

                // Is the feature enabled?
                if (this._enabled) {
                    const message = this.buildMessage(input);
                    result = message ? new vscode.Hover(message) : undefined;
                }
            }
        }

        return result;
    }

    public dispose(): void {
        this._configHelper.dispose();
    }

    private buildMessage(input: InputDefinition): string {
        let result: string = '';

        // Append message foreach configured format
        for (const format of this._targetFormats) {
            if (format === 'utc') {
                // UTC format
                const utc = this._timeConverter.epochToISOUtc(input.inputAsMs.toString());
                result += '  \n*UTC Timestamp*: `' + utc + '`';

            } else if (format === 'local') {
                // Local format
                const local = this._timeConverter.epochToIsoLocal(input.inputAsMs.toString());
                result += '  \n*Local Timestamp*: `' + local + '`';

            } else if (typeof format === 'string') {
                // Other simple custom format
                if (format) {
                    const custom = this._timeConverter.epochToCustom(
                        input.inputAsMs.toString(),
                        format);
                    result += '  \n*Formatted Timestamp*: `' + custom + '`';
                }

            } else if (format.customFormat) {
                // Advanced configured custom format

                // Handle deprecated localize option
                const timezone = format.timezone ? format.timezone : (format.localize !== undefined ? format.localize : true);

                const custom = this._timeConverter.epochToCustom(
                    input.inputAsMs.toString(),
                    format.customFormat,
                    timezone);
                if (format.name) {
                    result += '  \n*' + format.name + '*: `' + custom + '`';
                } else {
                    result += '  \n*Formatted Timestamp*: `' + custom + '`';
                }
            }
        }

        return result ? '*Epoch Unit*: `' + input.originalUnit + '`' + result : undefined;
    }

    private updateTimestampTargetFormat(value: any = ['utc']): void {
        if (typeof value === 'string') {
            this._targetFormats = [value];
        } else if (value instanceof Array) {
            this._targetFormats = value;
        }
    }
}

export { TimestampHoverProvider };
