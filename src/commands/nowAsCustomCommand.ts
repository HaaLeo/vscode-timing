'use strict';

import { CustomCommandBase } from './customCommandBase';

class NowAsCustomCommand extends CustomCommandBase {
    public async execute() {
        let userInput: string;
        const format = await this.getCustomFormat();

        if (format) {
            do {
                const result = this._timeConverter.getNowAsCustom(format);
                userInput = await this._dialogHandler.showResultDialog(
                    'Press enter to get current time',
                    'Current Time: ' + result,
                    ['Current Time: '.length, 'Current Time: '.length + result.length],
                    'Press enter to update.');
            } while (format && userInput !== undefined);
        }
    }
}

export { NowAsCustomCommand };
