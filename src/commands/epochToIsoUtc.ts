'use strict';

import * as vscode from 'vscode';
import InputDefinition = require('../inputDefinition');
import TimeConverter = require('../timeConverter');

export function epochToIsoUtc(timeConverter: TimeConverter): void {
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
            if (timeConverter.isValidEpoch(selectedExpression)) {
                const input = new InputDefinition(selectedExpression);
                const utc = timeConverter.epochToIsoUtc(input.inputAsMs);
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
                return timeConverter.isValidEpoch(userInput) ? null : 'Please insert epoch time.';
            }
        }
    ).then((userInput) => {
        if (userInput !== undefined) {
            const input = new InputDefinition(userInput);
            const result = timeConverter.epochToIsoUtc(input.inputAsMs);
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
            prompt: 'Input: ' + originalInput + ' (' + input.originalUnit + ')'
        }
    ).then((userInput) => {
        if (timeConverter.isValidEpoch(userInput)) {
            const nextInput: InputDefinition = new InputDefinition(userInput);
            const nextResult = timeConverter.epochToIsoUtc(nextInput.inputAsMs);
            showResultDialog(timeConverter, userInput, nextInput, nextResult);
        }
    });
}