'use strict';

import * as vscode from 'vscode';
import { DialogHandler } from '../dialogHandler';
import { InputBoxStep } from '../step/InputBoxStep';
import { MultiStepHandler } from '../step/MultiStepHandler';
import { TimeConverter } from '../util/timeConverter';

abstract class CommandBase {
    protected _dialogHandler: DialogHandler;
    protected _timeConverter: TimeConverter;
    protected _insertConvertedTime: boolean;
    protected _disposables: vscode.Disposable[];
    protected _stepHandler: MultiStepHandler;
    protected _showResultStep: InputBoxStep;
    protected _context: vscode.ExtensionContext;

    public constructor(context: vscode.ExtensionContext, timeConverter: TimeConverter, dialogHandler: DialogHandler) {
        this._dialogHandler = dialogHandler;
        this._timeConverter = timeConverter;
        this._context = context;
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

        if (typeof (config) === 'boolean') {
            this._insertConvertedTime = config;
        }
    }
}

export { CommandBase };
