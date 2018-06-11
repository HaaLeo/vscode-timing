'use strict';

import { InputDefinition } from '../inputDefinition';
import { CustomCommandBase } from './customCommandBase';

class IsoRfcToCustomCommand extends CustomCommandBase {

    public async execute() {
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
                const currentFormat = await this.getCustomFormat();
                if (!currentFormat) {
                    break;
                }

                const result = this._timeConverter.isoRfcToCustom(userInput, currentFormat);
                userInput = await this._dialogHandler.showResultDialog(
                    '123456789',
                    'Result: ' + result,
                    ['Result: '.length, 'Result: '.length + result.length],
                    'Input: ' + userInput);
            }
        } while (userInput !== undefined);
    }
}

export { IsoRfcToCustomCommand };