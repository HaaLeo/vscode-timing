'use strict';

import * as vscode from 'vscode';
import { DialogHandler } from '../dialogHandler';
import { InputDefinition } from '../inputDefinition';
import { TimeConverter } from '../timeConverter';

import { CommandBase } from './commandBase';

class CustomToEpochCommand extends CommandBase implements vscode.Disposable {

    private _disposables: vscode.Disposable[];
    private _customTimeFormatOptions: vscode.QuickPickItem[];
    private readonly _selectOtherFormat = 'Other Format...';
    public constructor(timeConverter: TimeConverter, dialogHandler: DialogHandler) {
        super(timeConverter, dialogHandler);
        this.updateCustomFormats();
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('timing.customFormats')) {
                this.updateCustomFormats();
            }

        }, this, this._disposables);
    }

    public async execute() {
        const targetOptions: vscode.QuickPickItem[] = [
            {
                label: 's',
                detail: 'seconds'
            },
            {
                label: 'ms',
                detail: 'milliseconds'
            },
            {
                label: 'ns',
                detail: 'nanoseconds'
            }
        ];

        let userInput = this.isInputSelected();

        do {
            let formatFromOptions: vscode.QuickPickItem = { label: this._selectOtherFormat };
            let currentFormat: string;

            if (this._customTimeFormatOptions.length > 1) {
                formatFromOptions = await this._dialogHandler.showOptionsDialog(this._customTimeFormatOptions);
            }

            if (!formatFromOptions) {
                break;
            } else if (formatFromOptions.label === this._selectOtherFormat) {
                currentFormat = await this._dialogHandler.showInputDialog(
                    'E.g.: YYYY/MM/DD',
                    'Insert custom format.',
                    (input) => input ? true : false,
                    'Ensure you enter a custom momentjs format.'
                );
            } else {
                currentFormat = formatFromOptions.label;
            }

            if (!this._timeConverter.isValidCustom(userInput, currentFormat)) {
                userInput = await this._dialogHandler.showInputDialog(
                    currentFormat,
                    'Insert time of format: ' + currentFormat,
                    (input) => this._timeConverter.isValidCustom(input, currentFormat),
                    'Ensure time and format are valid. (Format: ' + currentFormat + ')'
                );
            }

            if (userInput !== undefined) {
                const option = await this._dialogHandler.showOptionsDialog(targetOptions);
                if (!option) {
                    break;
                }
                const result = this._timeConverter.customToEpoch(userInput, currentFormat, option.label);
                userInput = await this._dialogHandler.showResultDialog(
                    'Press enter to pick new format',
                    'Result: ' + result + ' (' + new InputDefinition(result).originalUnit + ')',
                    ['Result: '.length, 'Result: '.length + result.length],
                    'Input: ' + userInput);

            }
        } while (userInput);
    }

    public dispose() {
        this._disposables.forEach((disposable) => {
            disposable.dispose();
        });
    }

    private updateCustomFormats(): void {
        const config = vscode.workspace.getConfiguration('timing')
            .get('customFormats') as Array<{ format: string, description?: string, detail?: string }>;

        this._customTimeFormatOptions = [];
        config.forEach((newFormat) => {
            if (newFormat.format) {
                this._customTimeFormatOptions.push({
                    label: newFormat.format,
                    description: newFormat.description,
                    detail: newFormat.detail
                });
            }
        });
        this._customTimeFormatOptions.push({ label: this._selectOtherFormat });
    }

}
export { CustomToEpochCommand };
