/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { HoverFormat } from './hoverFormat';
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
                    result = new vscode.Hover(this.buildMessage(input), timeRange);
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

    private buildMessage(input: InputDefinition): string {
        let result = '*Epoch Unit*: `' + input.originalUnit + '`';//*Timestamp*: `';

        // Append message foreach configured format
        this._targetFormats.forEach((format: (string | { customFormat: string, name: string, localize: boolean })) => {
            if (format === 'utc') {
                // UTC format
                const utc = this._timeConverter.epochToISOUtc(input.inputAsMs.toString());
                result += '  \n*UTC Timestamp*: `' + utc + '`';

            } else if (format === 'local') {
                // Local format
                const local = this._timeConverter.epochToIsoLocal(input.inputAsMs.toString());
                result += '  \n*Local Timestamp*:' + local + '`';

            } else if (typeof format === 'string') {
                // Other simple custom format
                const custom = this._timeConverter.epochToCustom(
                    input.inputAsMs.toString(),
                    format);
                result += '  \n*Formatted Timestamp*:' + custom + '`';

            } else if (format instanceof HoverFormat) {
                // Advanced configured custom format
                const custom = this._timeConverter.epochToCustom(
                    input.inputAsMs.toString(),
                    format.customFormat);
                if (format.name) {
                    result += '  \n*' + format.name + '*:' + custom + '`';
                } else {
                    result += '  \n*Formatted Timestamp' + custom + '`';
                }
            }
        });

        return result;
    }

    private updateTimestampTargetFormat(): void {
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp')
            .get<string>('targetFormat', 'utc');

        this._targetFormats = config;
    }

    private updateTimestampEnabled(): void {
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp')
            .get<boolean>('enabled', true);

        this._enabled = config;
    }
}

export { TimestampHoverProvider };
