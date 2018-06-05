'use strict';

import * as vscode from 'vscode';
import { InputDefinition } from '../inputDefinition';

import { CommandBase } from './commandBase';

class NowAsEpochCommand extends CommandBase {
    public execute(): void {
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

        this._dialogHandler.configure(
            (userInput: string) => userInput !== undefined ? true : false,
            'Press enter to get current epoch time',
            this._timeConverter.getNowAsEpoch,
            'not evaluated',
            'not evaluated',
            options
        );

        this._dialogHandler.showOptionsDialog(new InputDefinition('Current Time'));

    }
}

export { NowAsEpochCommand };
