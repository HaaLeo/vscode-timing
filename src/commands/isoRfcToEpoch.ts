'use strict';

import * as vscode from 'vscode';
import InputDefinition = require('../inputDefinition');
import TimeConverter = require('../timeConverter');

export function isoRfcToEpoch(timeConverter: TimeConverter): void {
    if (!timeConverter) {
        throw Error('The time converter must not be null or undefined.');
    }

    const userInput = isInputSelected(timeConverter);
    if (userInput === undefined) {
        showInputDialog(timeConverter);
    } else {
        showOptionsDialog(timeConverter, userInput);
    }
}

function isInputSelected(timeConverter: TimeConverter): string | undefined {
    let result: string;
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor !== undefined) {
        const activeSelection = activeEditor.selection;
        if (!activeSelection.isEmpty) {
            const selectedExpression = activeEditor.document.getText(activeSelection);
            if (timeConverter.isValidIsoRfc(selectedExpression)) {
                result = selectedExpression;
            }
        }
    }

    return result;
}

function showInputDialog(timeConverter: TimeConverter): void {
    vscode.window.showInputBox(
        {
            placeHolder: '1970-01-01T00:00:00.000Z',
            prompt: 'In insert valid ISO 8601 or RFC 2282 time.',
            validateInput: (userInput) => {
                return timeConverter.isValidIsoRfc(userInput) ? null : 'Insert valid ISO 8601 or RFC 2282 time.';
            }
        }
    ).then((userInput) => {
        if (userInput !== undefined) {
            showOptionsDialog(timeConverter, userInput);
        }
    });
}

function showOptionsDialog(timeConverter: TimeConverter, userInput: string): void {
    vscode.window.showQuickPick(['s', 'ms', 'ns'], {
        canPickMany: false,
        placeHolder: 'ms',
        matchOnDescription: true,
        matchOnDetail: true
    }).then((option) => {
        let result: number;
        if (option === 's') {
            result = timeConverter.isoRfcToEpoch(userInput) / 1000;
        } else if (option === 'ms') {
            result = timeConverter.isoRfcToEpoch(userInput);
        } else if (option === 'ns') {
            result = timeConverter.isoRfcToEpoch(userInput) * 1000000;
        }
        showResultDialog(timeConverter, userInput, result, option);
    });
}

function showResultDialog(
    timeConverter: TimeConverter,
    originalInput: string,
    result: number,
    targetUnit: string): void {
    vscode.window.showInputBox(
        {
            placeHolder: '1970-01-01T00:00:00.000Z',
            value: 'Result: ' + result + ' (' + targetUnit + ')',
            valueSelection: ['Result: '.length, 'Result: '.length + result.toString().length],
            prompt: 'Input: ' + originalInput
        }
    ).then((userInput) => {
        if (timeConverter.isValidIsoRfc(userInput)) {
            showOptionsDialog(timeConverter, userInput);
        }
    });
}
