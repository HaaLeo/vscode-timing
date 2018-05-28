'use strict';

import * as vscode from 'vscode';
import InputDefinition = require('../inputdefinition');
import TimeConverter = require('../timeconverter');

export function convertTime(timeConverter: TimeConverter): void {
    if (!timeConverter) {
        throw Error('The time converter must not be null or undefined.');
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor !== undefined) {
        const activeSelection = activeEditor.selection;
        if (activeSelection.isEmpty) {
            showInputDialog(timeConverter);
        } else {
            const selectedExpression = activeEditor.document.getText(activeSelection);
            if (!isNaN(Number(selectedExpression))) {
                const input = new InputDefinition(selectedExpression);
                const utc = timeConverter.convertToISO(input.inputAsMs);
                showResultDialog(timeConverter, selectedExpression, input, utc);
            } else {
                showInputDialog(timeConverter);
            }
        }
    } else {
        showInputDialog(timeConverter);
    }
}

function showInputDialog(timeConverter: TimeConverter): void {
    vscode.window.showInputBox(
        {
            placeHolder: '123456789',
            prompt: 'Insert epoch time.',
            validateInput: (userInput) => {
                return isNaN(Number(userInput)) ? 'Please insert epoch time.' : null;
            }
        }
    ).then((userInput) => {
        if (userInput !== undefined) {
            const input: InputDefinition = new InputDefinition(userInput);
            const result = timeConverter.convertToISO(input.inputAsMs);
            showResultDialog(timeConverter, userInput, input, result);
        }
    });
}

function showResultDialog(
    timeConverter: TimeConverter,
    originalInput: string,
    input: InputDefinition,
    result: string): void {
    vscode.window.showInputBox(
        {
            placeHolder: '123456789',
            value: 'Result: ' + result,
            valueSelection: ['Result: '.length, 'Result: '.length + result.length],
            prompt: 'Input: ' + originalInput + '(' + input.originalUnit + ')'
        }
    ).then((userInput) => {
        if (userInput !== undefined) {
            const nextInput: InputDefinition = new InputDefinition(userInput);
            const nextResult = timeConverter.convertToISO(nextInput.inputAsMs);
            showResultDialog(timeConverter, userInput, nextInput, nextResult);
        }
    });
}
