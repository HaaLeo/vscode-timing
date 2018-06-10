'use strict';

import { QuickPickItem } from 'vscode';
import { InputDefinition } from '../inputDefinition';

import { CustomCommandBase } from './customCommandBase';

class CustomToEpochCommand extends CustomCommandBase {

    public async execute() {
        const targetOptions: QuickPickItem[] = [
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
            const currentFormat = await this.getCustomFormat();
            if (!currentFormat) {
                break;
            }

            if (!this._timeConverter.isValidCustom(userInput, currentFormat)) {
                userInput = await this._dialogHandler.showInputDialog(
                    currentFormat,
                    'Insert time of format: ' + currentFormat,
                    (input) => this._timeConverter.isValidCustom(input, currentFormat),
                    'Ensure time and format are valid. (Format: ' + currentFormat + ')'
                );
            }

            if (userInput !== undefined) {
                const epochTargetFormat = await this._dialogHandler.showOptionsDialog(
                    targetOptions,
                    'Select epoch target format.');
                if (!epochTargetFormat) {
                    break;
                }
                const result = this._timeConverter.customToEpoch(userInput, currentFormat, epochTargetFormat.label);
                userInput = await this._dialogHandler.showResultDialog(
                    'Press enter to pick new format',
                    'Result: ' + result + ' (' + new InputDefinition(result).originalUnit + ')',
                    ['Result: '.length, 'Result: '.length + result.length],
                    'Time: ' + userInput);

            }
        } while (userInput !== undefined);
    }
}

export { CustomToEpochCommand };
