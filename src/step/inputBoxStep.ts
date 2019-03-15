/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { Disposable, InputBox, QuickInputButtons, window } from 'vscode';
import { InputFlowAction } from '../util/InputFlowAction';
import { IStep } from './IStep';
import { MultiStepHandler } from './multiStepHandler';
import { StepResult } from './stepResult';

/**
 * The input box step. Used to show a input box to the user.
 */
class InputBoxStep implements IStep {

    private _inputBox: InputBox;
    private _disposables: Disposable[] = [];
    private _validate: (input: string, ...args: string[]) => boolean;
    private _validationMessage: string;
    private _placeholder: string;
    private _title: string;
    private _prompt: string;
    private _unregisterOnBack: boolean;
    private _isRunning: boolean;
    private _skip: boolean;

    /**
     * Creates an InputBoxStep.
     * @param placeholder The input box's placeholder.
     * @param prompt The input box's prompt.
     * @param title The input box's title.
     * @param validationMessage The input box's validation message.
     * @param validationFn Function that validates the user's input.
     * @param skip Indicates whether this step shall be skipped when user input is valid.
     * @param unregisterOnBack Indicates whether this step is unregistered when the user navigates _Back_.
     */
    public constructor(
        placeholder: string,
        prompt: string,
        title: string,
        validationMessage: string,
        validationFn: (input: string, ...args: string[]) => boolean,
        skip: boolean = false,
        unregisterOnBack: boolean = false) {

        this._inputBox = window.createInputBox();
        this._inputBox.validationMessage = '';

        this._placeholder = placeholder;
        this._prompt = prompt;
        this._title = title;
        this._validationMessage = validationMessage;

        this._validate = validationFn;
        this._skip = skip;

        this._unregisterOnBack = unregisterOnBack;
        this._isRunning = false;

        this._disposables.push(this._inputBox);
    }

    /**
     * Execute this step.
     * @param handler The handler of the step.
     * @param step The step's number.
     * @param totalSteps The amount of overall steps.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     */
    public execute(
        handler: MultiStepHandler,
        step: number,
        totalSteps: number,
        ignoreFocusOut: boolean): Thenable<StepResult> {

        let previousResult = handler.getPreviousResult(this);

        this._isRunning = true;

        this._inputBox.step = step;
        this._inputBox.totalSteps = totalSteps;
        this._inputBox.ignoreFocusOut = ignoreFocusOut;
        this._inputBox.title = this.parse(this._title, previousResult);
        this._inputBox.prompt = this.parse(this._prompt, previousResult);
        this._inputBox.placeholder = this.parse(this._placeholder, previousResult);
        this._inputBox.validationMessage = '';
        this._inputBox.busy = false;
        this._inputBox.enabled = true;

        if (step > 1) {
            this._inputBox.buttons = [QuickInputButtons.Back];
        }

        return new Promise<StepResult>((resolve, reject) => {
            this._inputBox.onDidAccept(() => {
                this._inputBox.busy = true;
                this._inputBox.enabled = false;

                // Update

                previousResult = handler.getPreviousResult(this);

                if (this._validate(this._inputBox.value, previousResult)) {
                    this._isRunning = false;
                    this._inputBox.hide();
                    resolve(new StepResult(InputFlowAction.Continue, this._inputBox.value));
                } else {
                    this._inputBox.validationMessage = this.parse(this._validationMessage, previousResult);
                    this._inputBox.busy = false;
                    this._inputBox.enabled = true;
                }
            }, this, this._disposables);

            this._inputBox.onDidChangeValue((current) => {
                this._inputBox.busy = true;
                this._inputBox.enabled = false;

                // Update
                previousResult = handler.getPreviousResult(this);

                if (this._validate(current, previousResult)) {
                    this._inputBox.validationMessage = '';
                } else {
                    this._inputBox.validationMessage = this.parse(this._validationMessage, previousResult);
                }
                this._inputBox.busy = false;
                this._inputBox.enabled = true;
            }, this, this._disposables);

            this._inputBox.onDidTriggerButton((button) => {
                if (button === QuickInputButtons.Back) {
                    this._inputBox.busy = true;
                    this._inputBox.enabled = false;

                    // Check whether this input box is running,
                    // because event fires when button on any input box is pressed
                    if (this._isRunning && this._unregisterOnBack) {
                        handler.unregisterStep(this);
                    }
                    this._isRunning = false;
                    this._inputBox.hide();
                    resolve(new StepResult(InputFlowAction.Back, undefined));
                }
            }, this, this._disposables);

            this._inputBox.onDidHide(() => {
                this._inputBox.busy = true;
                this._inputBox.enabled = false;

                resolve(new StepResult(InputFlowAction.Cancel, undefined));
                this._isRunning = false;
            });

            this._inputBox.show();
        });
    }

    public get skip(): boolean {
        return this._skip;
    }

    public get validation(): (input: string, ...args: string[]) => boolean {
        return this._validate;
    }

    /**
     * Resets the step's current value
     */
    public reset(): void {
        this._inputBox.value = '';
    }

    /**
     * Dispose this object.
     */
    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

    /**
     * Replaces the `$(prior-result)` keyword of the @param input with the @param replaceValue.
     * @param input The input string.
     * @param replaceValue The inserted value
     */
    private parse(input: string, replaceValue: string): string {
        const result = input.replace('$(prior-result)', replaceValue);
        return result;
    }
}

export { InputBoxStep };
