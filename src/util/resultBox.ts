'use strict';

import { Disposable, ExtensionContext, InputBox, QuickInputButton, QuickInputButtons, Uri, window } from 'vscode';
import { StepResult } from '../step/stepResult';
import { InputFlowAction } from './InputFlowAction';

/**
 * The ResultBox. Used to show conversion results.
 */
class ResultBox {

    private _resultBox: InputBox;
    private _disposables: Disposable[];
    private _insertButton: QuickInputButton;

    constructor(insertButton: QuickInputButton) {
        this._insertButton = insertButton;
        this._resultBox = window.createInputBox();
        this._resultBox.ignoreFocusOut = true;
        this._resultBox.validationMessage = '';
        this._disposables = [this._resultBox];
    }

    /**
     * Show the result box to the user.
     * @param prompt The box's prompt.
     * @param title The box's title.
     * @param value The box's value.
     * @param insertAction The action to invoke when the insert button was clicked.
     * @param backButton Indicates whether a back button is added or not.
     * @returns The result of the user's interaction.
     */
    public show(
        prompt: string,
        title: string,
        value: string,
        insertAction: (insertion: string) => Thenable<boolean>,
        backButton: boolean = true): Thenable<StepResult> {

        this._resultBox.buttons = backButton ? [QuickInputButtons.Back, this._insertButton] : [this._insertButton];
        this._resultBox.prompt = prompt;
        this._resultBox.title = title;
        this._resultBox.value = value;
        return new Promise<StepResult>((resolve, reject) => {
            this._resultBox.onDidAccept(() => {
                this._resultBox.hide();
                resolve(new StepResult(InputFlowAction.Continue, undefined));
            }, this, this._disposables);

            this._resultBox.onDidTriggerButton(async (button) => {
                if (button === QuickInputButtons.Back) {
                    this._resultBox.hide();
                    resolve(new StepResult(InputFlowAction.Back, undefined));
                } else if (button === this._insertButton) {
                    await insertAction(this._resultBox.value);
                }
            }, this, this._disposables);

            this._resultBox.onDidHide(() => {
                resolve(new StepResult(InputFlowAction.Cancel, undefined));
            }, this, this._disposables);

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
