'use strict';

import * as vscode from 'vscode';
import { InputDefinition } from '../inputDefinition';

import { CommandBase } from './commandBase';

class NowAsIsoLocalCommand extends CommandBase {
    public execute(): void {
        this._dialogHandler.configure(
            (userInput: string) => userInput !== undefined ? true : false,
            'not evaluated',
            this._timeConverter.getNowAsIsoLocal,
            'Press enter to get current ISO Local time',
            'Not evaluated'
        );

        this._dialogHandler.showOptionsDialog(new InputDefinition('Current Time'));

    }
}

export { NowAsIsoLocalCommand };
