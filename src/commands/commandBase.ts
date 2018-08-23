'use strict';

import * as vscode from 'vscode';
import { DialogHandler } from '../dialogHandler';
import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { TimeConverter } from '../util/timeConverter';

abstract class CommandBase {
    protected _dialogHandler: DialogHandler;
    protected _timeConverter: TimeConverter;
    protected _insertConvertedTime: boolean;
    protected _disposables: vscode.Disposable[];
    protected _stepHandler: MultiStepHandler;
    protected _showResultStep: InputBoxStep;
    protected _insertResultButton: vscode.QuickInputButton;

    public constructor(context: vscode.ExtensionContext, timeConverter: TimeConverter, dialogHandler: DialogHandler) {
        this._dialogHandler = dialogHandler;
        this._timeConverter = timeConverter;
        this._insertResultButton = {
            iconPath: {
                dark: vscode.Uri.file(context.asAbsolutePath('resources/pencil_dark.svg')),
                light: vscode.Uri.file(context.asAbsolutePath('resources/pencil_light.svg'))
            },
            tooltip: 'Insert Result'
        };
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
