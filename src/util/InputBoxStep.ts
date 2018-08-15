'use strict';

import { Disposable, InputBox, QuickInputButton, QuickInputButtons, window } from 'vscode';
import { InputFlowAction } from './InputFlowAction';
import { IStep } from './IStep';
import { StepResult } from './StepResult';

class InputBoxStep implements IStep {

    private _buttons: QuickInputButton[];
    private _inputBox: InputBox;
    private _disposables: Disposable[] = [];
    private _validate: (string) => boolean;
    private _validationMessage: string;

    public constructor(
        placeholder: string,
        prompt: string,
        title: string,
        validationMessage: string,
        buttons: QuickInputButton[],
        validationFn: (input: string) => boolean) {

        this._inputBox = window.createInputBox();
        this._inputBox.placeholder = placeholder;
        this._inputBox.prompt = prompt;
        this._inputBox.title = title;
        this._inputBox.ignoreFocusOut = true;
        this._inputBox.validationMessage = '';

        this._buttons = buttons;
        this._validate = validationFn;
        this._validationMessage = validationMessage;

        this._disposables.push(this._inputBox);
    }

    public execute(step: number, totalSteps: number): Promise<StepResult> {
        this._inputBox.step = step;
        this._inputBox.totalSteps = totalSteps;
        return new Promise<StepResult>((resolve, reject) => {
            if (step > 1) {
                this._inputBox.buttons = [QuickInputButtons.Back, ...this._buttons];
            } else {
                this._inputBox.buttons = this._buttons;
            }

            this._inputBox.onDidAccept(() => {
                if (this._validate(this._inputBox.value)) {
                    this._inputBox.hide();
                    resolve(new StepResult(InputFlowAction.Continue, this._inputBox.value, step + 1, totalSteps));
                    this._inputBox.hide();
                } else {
                    this._inputBox.validationMessage = this._validationMessage;
                }

            });

            this._inputBox.onDidChangeValue((current) => {
                if (this._validate(current)) {
                    this._inputBox.validationMessage = '';
                } else {
                    this._inputBox.validationMessage = this._validationMessage;
                }
            });

            this._inputBox.onDidTriggerButton((button) => {
                if (button === QuickInputButtons.Back) {
                    resolve(new StepResult(InputFlowAction.Back, undefined, step - 1, totalSteps));
                    this._inputBox.hide();
                }
            });

            this._inputBox.onDidHide(() => {
                resolve(new StepResult(InputFlowAction.Cancel, undefined, 0, totalSteps));
            });

            this._inputBox.show();
        });
    }

    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

}

export { InputBoxStep };
