'use strict';

import * as vscode from 'vscode';
import InputDefinition = require('../inputDefinition');
import TimeConverter = require('../timeConverter');

export function isoRfcToEpoch(timeConverter: TimeConverter): void {
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
            if (timeConverter.isValidIsoRfc(selectedExpression)) {
                const epoch = timeConverter.isoRfcToEpoch(selectedExpression);
                showResultDialog(timeConverter, selectedExpression, epoch);
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
            placeHolder: '1970-01-01T00:00:00.000Z',
            prompt: 'Insert epoch time.',
            validateInput: (userInput) => {
                return timeConverter.isValidIsoRfc(userInput) ? null : 'Please insert ISO 86 time.';
            }
        }
    ).then((userInput) => {
        if (userInput !== undefined) {
            const result = timeConverter.isoRfcToEpoch(userInput);
            showResultDialog(timeConverter, userInput, result);
        }
    });
}

function showResultDialog(
    timeConverter: TimeConverter,
    originalInput: string,
    result: number): void {
    vscode.window.showInputBox(
        {
            placeHolder: '1970-01-01T00:00:00.000Z',
            value: 'Result: ' + result,
            valueSelection: ['Result: '.length, 'Result: '.length + result.toString().length],
            prompt: 'Input: ' + originalInput
        }
    ).then((userInput) => {
        if (timeConverter.isValidIsoRfc(userInput)) {
            const nextResult = timeConverter.isoRfcToEpoch(userInput);
            showResultDialog(timeConverter, userInput, nextResult);
        }
    });
}
