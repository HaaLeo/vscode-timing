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
            userInput = await this._dialogHandler.showResultDialog(
                'Press enter to get current time',
                'Current Time: ' + result,
                ['Current Time: '.length, 'Current Time: '.length + result.length],
                'Press enter to update.');

        } while (userInput !== undefined);
    }
}

export { NowAsEpochCommand };
