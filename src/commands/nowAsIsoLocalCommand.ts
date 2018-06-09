'use strict';

import { CommandBase } from './commandBase';

class NowAsIsoLocalCommand extends CommandBase {
    public async execute() {
        let userInput: string;
        do {
            const result = this._timeConverter.getNowAsIsoLocal();
            userInput = await this._dialogHandler.showResultDialog(
                'Press enter to get current time',
                'Current Time: ' + result,
                ['Current Time: '.length, 'Current Time: '.length + result.length],
                'Press enter to update.');

        } while (userInput !== undefined);
    }
}

export { NowAsIsoLocalCommand };
