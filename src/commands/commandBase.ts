'use strict';

import * as vscode from 'vscode';
import { DialogHandler } from '../dialogHandler';
import { TimeConverter } from '../timeConverter';

abstract class CommandBase {
    protected _dialogHandler: DialogHandler;
    protected _timeConverter: TimeConverter;

    public constructor(timeConverter: TimeConverter, dialogHandler: DialogHandler) {
        this._dialogHandler = dialogHandler;
        this._timeConverter = timeConverter;
    }
    public abstract execute(): void;

    protected isInputSelected(): string | undefined {
        let result: string;
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            const activeSelection = activeEditor.selection;
            if (!activeSelection.isEmpty) {
                result = activeEditor.document.getText(activeSelection);
            }
        }

        return result;
    }
}

export { CommandBase };
