'use strict';

import * as vscode from 'vscode';
import { MultiStepHandler } from '../step/multiStepHandler';
import { ResultBox } from '../util/resultBox';
import { TimeConverter } from '../util/timeConverter';

abstract class CommandBase {

    protected _timeConverter: TimeConverter;
    protected _disposables: vscode.Disposable[];
    protected _stepHandler: MultiStepHandler;
    protected _resultBox: ResultBox;

    protected _insertConvertedTime: boolean;
    protected _hideResultViewOnEnter: boolean;
    protected _ignoreFocusOut: boolean;

    public constructor(context: vscode.ExtensionContext, timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;

        this._resultBox = new ResultBox({
            iconPath: {
                dark: vscode.Uri.file(context.asAbsolutePath('resources/pencil_dark.svg')),
                light: vscode.Uri.file(context.asAbsolutePath('resources/pencil_light.svg'))
            },
            tooltip: 'Insert Result'
        });

        this.updateInsertConvertedTime();
        this.updateIgnoreFocusOut();
        this.updateHideResultViewOnEnter();
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.insertConvertedTime')) {
                this.updateInsertConvertedTime();
            } else if (changedEvent.affectsConfiguration('timing.ignoreFocusOut')) {
                this.updateIgnoreFocusOut();
            } else if (changedEvent.affectsConfiguration('timing.hideResultViewOnEnter')) {
                this.updateHideResultViewOnEnter();
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

    private updateHideResultViewOnEnter(): void {
        const config = vscode.workspace.getConfiguration('timing')
            .get('hideResultViewOnEnter');

        if (typeof (config) === 'boolean') {
            this._hideResultViewOnEnter = config;
        }
    }

    private updateIgnoreFocusOut(): void {
        const config = vscode.workspace.getConfiguration('timing')
            .get('ignoreFocusOut');

        if (typeof (config) === 'boolean') {
            this._ignoreFocusOut = config;
        }
    }
}

export { CommandBase };
