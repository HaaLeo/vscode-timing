'use strict';

import { InputDefinition } from '../inputDefinition';

import { CommandBase } from './commandBase';

class EpochToIsoUtcCommand extends CommandBase {
    public async execute() {

        let userInput = this.isInputSelected();

        do {
            let input = new InputDefinition(userInput);
            if (!input.inputAsMs || !this._timeConverter.isValidEpoch(input.inputAsMs.toString())) {
                userInput = await this._dialogHandler.showInputDialog(
                    '123456789',
                    'Insert epoch time.',
                    this._timeConverter.isValidEpoch,
                    'Ensure the epoch time is valid.'
                );
            }
            if (userInput !== undefined) {
                input = new InputDefinition(userInput);
                const result = this._timeConverter.epochToIsoUtc(input.inputAsMs.toString());
                userInput = await this._dialogHandler.showResultDialog(
                    '123456789',
                    'Result: ' + result,
                    ['Result: '.length, 'Result: '.length + result.length],
                    'Input: ' + userInput + ' (' + new InputDefinition(userInput).originalUnit + ')');
            }
        } while (userInput);
    }
}

export { EpochToIsoUtcCommand };
