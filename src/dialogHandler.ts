'use strict';

import * as vscode from 'vscode';

import { InputDefinition } from './inputDefinition';

class DialogHandler {

    private _validateTime: (date: string) => boolean;
    private _diagnosisMessage: string;
    private _convertTime: (time: string, option: string | undefined) => string;
    private _options: vscode.QuickPickItem[];
    private _placeholder: string;
    private _prompt: string;

    public configure(
        validateTime: (date: string) => boolean,
        diagnoseMessage: string,
        convertTime: (time: string, option?: string) => string,
        placeholder: string,
        prompt: string,
        options?: vscode.QuickPickItem[]) {

        this._convertTime = convertTime;
        this._validateTime = validateTime;
        this._options = options;
        this._diagnosisMessage = diagnoseMessage;
        this._placeholder = placeholder;
        this._prompt = prompt;
    }

    public showInputDialog(): void {
        vscode.window.showInputBox(
            {
                placeHolder: this._placeholder,
                prompt: this._prompt,
                validateInput: (userInput) => {
                    const input = new InputDefinition(userInput);
                    return this._validateTime(input.inputAsMs ? input.inputAsMs.toString() : input.originalInput)
                        ? null : this._diagnosisMessage;
                }
            }
        ).then((userInput) => {
            if (userInput !== undefined) {
                const input = new InputDefinition(userInput);
                this.showOptionsDialog(input);
            }
        });
    }

    public showOptionsDialog(userInput: InputDefinition): void {
        if (this._options) {
            vscode.window.showQuickPick(this._options, {
                canPickMany: false,
                placeHolder: this._options[0].label,
                matchOnDescription: true,
                matchOnDetail: true
            }).then((option) => {
                const result = this._convertTime(
                    userInput.inputAsMs ? userInput.inputAsMs.toString() : userInput.originalInput,
                    option.label);
                this.showResultDialog(userInput, result, option.label);
            });
        } else {
            const result = this._convertTime(
                userInput.inputAsMs ? userInput.inputAsMs.toString() : userInput.originalInput,
                undefined);
            this.showResultDialog(userInput, result, undefined);
        }
    }

    public showResultDialog(
        userInput: InputDefinition,
        result: string,
        targetUnit: string | undefined): void {
        vscode.window.showInputBox(
            {
                placeHolder: this._placeholder,
                value: 'Result: ' + result + (targetUnit ? ' (' + targetUnit + ')' : ''),
                valueSelection: ['Result: '.length, 'Result: '.length + result.toString().length],
                prompt: 'Input: ' + userInput.originalInput +
                    (userInput.originalUnit ? ' (' + userInput.originalUnit + ')' : '')
            }
        ).then((nextUserInput) => {
            const nextInput = new InputDefinition(nextUserInput);
            if (this._validateTime(nextInput.inputAsMs ? nextInput.inputAsMs.toString() : nextInput.originalInput)) {
                this.showOptionsDialog(nextInput);
            }
        });
    }
}

export { DialogHandler };
