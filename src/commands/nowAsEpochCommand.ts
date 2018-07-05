'use strict';

import * as vscode from 'vscode';

import { CommandBase } from './commandBase';

class NowAsEpochCommand extends CommandBase {
    public async execute() {
        const options: vscode.QuickPickItem[] = [
            {
                label: 's',
                detail: 'seconds'
            },
            {
                label: 'ms',
                detail: 'milliseconds'
            },
            {
                label: 'ns',
                detail: 'nanoseconds'
            }
        ];

        let userInput: string;
        do {
            const epochFormat = await this._dialogHandler.showOptionsDialog(
                options,
                'Select epoch target format.');
            if (!epochFormat) {
                break;
            }
            const result = this._timeConverter.getNowAsEpoch(epochFormat.label);
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

export { NowAsEpochCommand };
