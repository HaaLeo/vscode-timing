'use strict';

import * as vscode from 'vscode';
import { DialogHandler } from '../dialogHandler';
import { TimeConverter } from '../timeConverter';

abstract class CommandBase {
    protected _dialogHandler: DialogHandler;
    protected _timeConverter: TimeConverter;
    protected _insertConvertedTime: boolean;
    protected _disposables: vscode.Disposable[];

    public constructor(timeConverter: TimeConverter, dialogHandler: DialogHandler) {
        this._dialogHandler = dialogHandler;
        this._timeConverter = timeConverter;
        this.updateInsertConvertedTime();
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.insertConvertedTime')) {
                this.updateInsertConvertedTime();
            }
        }, this, this._disposables);
    }

    public abstract execute(): void;

    public dispose() {
        this._disposables.forEach((disposable) => {
            disposable.dispose();
        });
    }

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

    protected insert(insertion: string): Thenable<boolean> {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            return activeEditor.edit((editBuilder) => {
                editBuilder.replace(activeEditor.selection, insertion);
            });
        }
    }

    private updateInsertConvertedTime(): void {
        const config = vscode.workspace.getConfiguration('timing')
            .get('insertConvertedTime');

        if (config === undefined) {
            this._insertConvertedTime = false;
        } else if (typeof (config) === 'boolean') {
            this._insertConvertedTime = config;
        }
    }
}

export { CommandBase };
