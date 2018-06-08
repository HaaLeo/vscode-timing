'use strict';

import * as vscode from 'vscode';

import { InputDefinition } from './inputDefinition';

class DialogHandler {

    public showInputDialog(
        placeHolder: string,
        prompt: string,
        validateUserInput: (userInput: string) => boolean,
        diagnoseMessage: string): Thenable<string> {
        return vscode.window.showInputBox(
            {
                placeHolder,
                prompt,
                validateInput: (userInput) => {
                    const input = new InputDefinition(userInput);
                    let isValid: boolean;
                    if (input.inputAsMs) {
                        isValid = validateUserInput(input.inputAsMs.toString());
                    } else {
                        isValid = validateUserInput(input.originalInput);
                    }

                    return isValid ? null : diagnoseMessage;
                }
            }
        );
    }

    public showOptionsDialog(options: vscode.QuickPickItem[]): Thenable<vscode.QuickPickItem> {
        return vscode.window.showQuickPick(
            options,
            {
                canPickMany: false,
                placeHolder: options[0].label,
                matchOnDescription: true,
                matchOnDetail: true
            });
    }

    public showResultDialog(
    placeHolder: string,
    value: string,
    valueSelection: [number, number],
    prompt: string): Thenable<string> {
        return vscode.window.showInputBox(
            {
                placeHolder,
                value,
                valueSelection,
                prompt
            }
        );
    }
}

export { DialogHandler };
