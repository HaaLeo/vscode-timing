'use strict';

import * as vscode from 'vscode';
import { InputDefinition } from '../inputDefinition';
import { CommandBase } from './commandBase';

class IsoRfcToEpochCommand extends CommandBase {

    public async execute() {
        const options: vscode.QuickPickItem[] = [
            {
                label: 's',
                detail: 'seconds'
            },
            {
                label: 'ms',
                detail: 'milliseconds'
            },
            {
                label: 'ns',
                detail: 'nanoseconds'
            }
        ];

        let userInput = this.isInputSelected();

        do {
            if (!this._timeConverter.isValidIsoRfc(userInput)) {
                userInput = await this._dialogHandler.showInputDialog(
                    '1970-01-01T00:00:00.000Z',
                    'Insert a ISO 8601 or RFC 2282 time.',
                    this._timeConverter.isValidIsoRfc,
                    'Ensure the time is valid.'
                );
            }
            if (userInput !== undefined) {
                const option = await this._dialogHandler.showOptionsDialog(
                    options,
                    'Select epoch target format.');
                if (!option) {
                    break;
                }
                const result = this._timeConverter.isoRfcToEpoch(userInput, option.label);
                userInput = await this._dialogHandler.showResultDialog(
                    '1970-01-01T00:00:00.000Z',
                    'Result: ' + result + ' (' + new InputDefinition(result).originalUnit + ')',
                    ['Result: '.length, 'Result: '.length + result.length],
                    'Input: ' + userInput);
            }
        } while (userInput);
    }
}
export { IsoRfcToEpochCommand };
