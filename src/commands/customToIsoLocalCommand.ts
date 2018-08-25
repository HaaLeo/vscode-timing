'use strict';

import { CustomCommandBase } from './customCommandBase';

class CustomToIsoLocalCommand extends CustomCommandBase {

    public async execute() {
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
                const result = this._timeConverter.customToIsoLocal(userInput, currentFormat);
                let inserted: boolean = false;
                if (this._insertConvertedTime) {
                    inserted = await this.insert(result);
                }
                const resultPrefix = inserted ? 'Inserted Result: ' : 'Result: ';

                userInput = await this._dialogHandler.showResultDialog(
                    'Press enter to pick new format',
                    resultPrefix + result,
                    [resultPrefix.length, resultPrefix.length + result.length],
                    'Time: ' + userInput);

            }
        } while (userInput !== undefined);
    }
}

export { CustomToIsoLocalCommand };
