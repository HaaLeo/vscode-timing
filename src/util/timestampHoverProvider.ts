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

class TimestampHoverProvider implements vscode.HoverProvider, vscode.Disposable {

    private _timeConverter: TimeConverter;

    private _disposables: vscode.Disposable[];

    private _targetFormats: Array<string | { customFormat: string, name: string, localize: boolean }>;
    private _enabled: boolean;

    constructor(timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;

        this.updateTimestampEnabled();
        this.updateTimestampTargetFormat();

        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.hoverTimestamp.targetFormat')) {
                this.updateTimestampTargetFormat();
            } else if (changedEvent.affectsConfiguration('timing.hoverTimestamp.enabled')) {
                this.updateTimestampEnabled();
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
        this._disposables.forEach((disposable) => disposable.dispose());
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
                const custom = this._timeConverter.epochToCustom(
                    input.inputAsMs.toString(),
                    format.customFormat,
                    format.localize);
                if (format.name) {
                    result += '  \n*' + format.name + '*: `' + custom + '`';
                } else {
                    result += '  \n*Formatted Timestamp*: `' + custom + '`';
                }
            }
        }

        return result ? '*Epoch Unit*: `' + input.originalUnit + '`' + result : undefined;
    }

    private updateTimestampTargetFormat(): void {
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp');
        const value = config.get<any>('targetFormat', ['utc']);
        if (typeof value === 'string') {
            this._targetFormats = [value];
        } else if (value instanceof Array) {
            this._targetFormats = value;
        }
    }

    private updateTimestampEnabled(): void {
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp')
            .get<boolean>('enabled', true);

        this._enabled = config;
    }
}

export { TimestampHoverProvider };
