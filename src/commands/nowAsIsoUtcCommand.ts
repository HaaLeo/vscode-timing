'use strict';

import { CommandBase } from './commandBase';

class NowAsIsoUtcCommand extends CommandBase {
    public async execute() {
        let userInput: string;
        do {
            const result = this._timeConverter.getNowAsIsoUtc();
            userInput = await this._dialogHandler.showResultDialog(
                'Press enter to get current time',
                'Current Time: ' + result,
                ['Current Time: '.length, 'Current Time: '.length + result.length],
                'Press enter to update.');

        } while (userInput !== undefined);
    }
}

export { NowAsIsoUtcCommand };
