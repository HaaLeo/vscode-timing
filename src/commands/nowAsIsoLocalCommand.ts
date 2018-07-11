'use strict';

import { CommandBase } from './commandBase';

class NowAsIsoLocalCommand extends CommandBase {
    public async execute() {
        let userInput: string;
        do {
            const result = this._timeConverter.getNowAsIsoLocal();
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

        } while (userInput !== undefined);
    }
}

export { NowAsIsoLocalCommand };
