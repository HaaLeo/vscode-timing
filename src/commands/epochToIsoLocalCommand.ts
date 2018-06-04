'use strict';

import * as vscode from 'vscode';
import { InputDefinition } from '../inputDefinition';

import { CommandBase } from './commandBase';

class EpochToIsoLocalCommand extends CommandBase {
    public execute(): void {
        this._dialogHandler.configure(
            this._timeConverter.isValidEpoch,
            'Ensure the epoch time is valid.',
            this._timeConverter.epochToIsoLocal,
            '123456789',
            'Insert epoch time.'
        );

        const userInput = this.isInputSelected(this._timeConverter.isValidEpoch);
        if (userInput === undefined) {
            this._dialogHandler.showInputDialog();
        } else {
            this._dialogHandler.showOptionsDialog(new InputDefinition(userInput));
        }

    }
}

export {EpochToIsoLocalCommand};
