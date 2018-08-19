'use strict';

import { Disposable, InputBox, QuickInputButton, QuickInputButtons, window } from 'vscode';
import { InputFlowAction } from './InputFlowAction';
import { StepResult } from './StepResult';

/**
 * The ResultBox. Used to show conversion results.
 */
class ResultBox {

    private _resultBox: InputBox = window.createInputBox();
    private _disposables: Disposable[] = [];

    /**
     * Show the result box to the user.
     * @param prompt The box's prompt.
     * @param title The box's title.
     * @param value The box's value.
     * @returns The result of the user's interaction.
     */
    public show(prompt: string, title: string, value: string): Thenable<StepResult> {
        this._resultBox.buttons = [QuickInputButtons.Back]; // use insert button
        this._resultBox.prompt = prompt;
        this._resultBox.title = title;
        this._resultBox.value = value;
        return new Promise<StepResult>((resolve, reject) => {
            this._resultBox.onDidAccept(() => {
                if (this._resultBox.value) {
                    this._resultBox.hide();
                    resolve(new StepResult(InputFlowAction.Continue, this._resultBox.value));
                } else {
                    this._resultBox.validationMessage = 'The input box must not be empty.';
                }
            });

            this._resultBox.onDidChangeValue((current) => {
                if (current) {
                    this._resultBox.validationMessage = '';
                } else {
                    this._resultBox.validationMessage = 'The input box must not be empty.';
                }
            });

            this._resultBox.onDidTriggerButton((button) => {
                if (button === QuickInputButtons.Back) {
                    this._resultBox.hide();
                    resolve(new StepResult(InputFlowAction.Back, undefined));
                }
            });

            this._resultBox.onDidHide(() => {
                resolve(new StepResult(InputFlowAction.Cancel, undefined));
            });

            this._resultBox.show();
        });
    }

    /**
     * Dispose this object.
     */
    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }
}

export { ResultBox };
