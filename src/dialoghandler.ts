'use strict';

import * as vscode from 'vscode';
import TimeConverter = require('./timeconverter')

class DialogHandler {

    private _timeConverter: TimeConverter;

    constructor(timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;
    }

    public showInputDialog(): void {
        vscode.window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: '123456789',
                prompt: 'Insert epoch time.',
                validateInput: userInput => {
                    return isNaN(Number(userInput)) ? 'Please insert epoch time.' : null
                }
            }
        ).then(userInput => {
            if (userInput !== undefined) {
                const input = this.getInputDefinition(userInput)
                let result = this._timeConverter.convertToISO(input.ms)
                this.showResultDialog(userInput, input ,result)
            }
        })
    }

    private showResultDialog(userInput: string, input:any, result: string): void {
        vscode.window.showInputBox(
            {
                ignoreFocusOut: true,
                placeHolder: '123456789',
                value: 'Result: ' + result,
                valueSelection: ['Result: '.length, 'Result: '.length + result.length],
                prompt: 'Input: ' + userInput + '(' + input.unit + ')'
            }
        ).then(userInput => {
            if (userInput !== undefined) {
                const input = this.getInputDefinition(userInput)
                let result = this._timeConverter.convertToISO(input.ms)
                this.showResultDialog(userInput, input, result)
            }
        })
    }

    private getInputDefinition(value: string) : any{
        let input;
        if (value.length <= 11) {
            input = this.createInputDefinition(Number(value) * 1000, 's')
        } else if (value.length <= 14) {
            input = this.createInputDefinition(Number(value), 'ms')
        } else if (value.length <= 21) {
            input = this.createInputDefinition(Number(value) / 1000000, 'ns')
        } else {
            throw Error('Unknown format: number with ' + value.length + ' digits.');
        }
        return input
    }

    private createInputDefinition(ms: number, unit:string) {
        return { "ms": ms, "unit": unit};
    }
}

export = DialogHandler;
