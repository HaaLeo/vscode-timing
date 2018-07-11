'use strict';

import { CustomCommandBase } from './customCommandBase';

class NowAsCustomCommand extends CustomCommandBase {
    public async execute() {
        let userInput: string;
        const format = await this.getCustomFormat();

        if (format) {
            do {
                const result = this._timeConverter.getNowAsCustom(format);
                let inserted: boolean = false;
                if (this._insertConvertedTime) {
                    inserted = await this.insert(result);
                }
                const resultPrefix = inserted ? 'Inserted Current Time: ' : 'Current Time: ';

                userInput = await this._dialogHandler.showResultDialog(
                    'Press enter to get current time',
                    resultPrefix + result,
                    [resultPrefix.length, resultPrefix.length + result.length],
                    'Press enter to update.');
            } while (format && userInput !== undefined);
        }
    }
}

export { NowAsCustomCommand };
