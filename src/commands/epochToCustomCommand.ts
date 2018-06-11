'use strict';

import { InputDefinition } from '../inputDefinition';

import { CustomCommandBase } from './customCommandBase';

class EpochToCustomCommand extends CustomCommandBase {

    public async execute() {
        let userInput = this.isInputSelected();

        do {
            let input = new InputDefinition(userInput);
            if (!input.inputAsMs || !this._timeConverter.isValidEpoch(input.inputAsMs.toString())) {
                userInput = await this._dialogHandler.showInputDialog(
                    '123456789',
                    'Insert epoch time',
                    this._timeConverter.isValidEpoch,
                    'Ensure the epoch time is valid.'
                );
                input = new InputDefinition(userInput);
            }

            if (userInput !== undefined) {
                const currentFormat = await this.getCustomFormat();
                if (!currentFormat) {
                    break;
                }

                const result = this._timeConverter.epochToCustom(input.inputAsMs.toString(), currentFormat);
                userInput = await this._dialogHandler.showResultDialog(
                    '123456789',
                    'Result: ' + result,
                    ['Result: '.length, 'Result: '.length + result.length],
                    'Input: ' + input.originalInput + ' (' + input.originalUnit + ')');

            }
        } while (userInput !== undefined);
    }
}

export { EpochToCustomCommand };