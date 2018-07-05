'use strict';

import { InputDefinition } from '../inputDefinition';

import { CommandBase } from './commandBase';

class EpochToIsoLocalCommand extends CommandBase {
    public async execute() {

        let userInput = this.isInputSelected();

        do {
            let input = new InputDefinition(userInput);
            if (!input.inputAsMs || !this._timeConverter.isValidEpoch(input.inputAsMs.toString())) {
                userInput = await this._dialogHandler.showInputDialog(
                    '123456789',
                    'Insert epoch time.',
                    this._timeConverter.isValidEpoch,
                    'Ensure the epoch time is valid.',
                );
            }
            if (userInput !== undefined) {
                input = new InputDefinition(userInput);
                const result = this._timeConverter.epochToIsoLocal(input.inputAsMs.toString());
                let inserted: boolean = false;
                if (this._insertConvertedTime) {
                    inserted = await this.insert(result);
                }
                const resultPrefix = inserted ? 'Inserted Result: ' : 'Result: ';

                userInput = await this._dialogHandler.showResultDialog(
                    '123456789',
                    resultPrefix + result,
                    [resultPrefix.length, resultPrefix.length + result.length],
                    'Input: ' + userInput + ' (' + new InputDefinition(userInput).originalUnit + ')');
            }
        } while (userInput);
    }
}

export { EpochToIsoLocalCommand };
