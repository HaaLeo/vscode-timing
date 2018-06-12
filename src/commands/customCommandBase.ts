'use strict';

import * as vscode from 'vscode';
import { DialogHandler } from '../dialogHandler';
import { TimeConverter } from '../timeConverter';
import { CommandBase } from './commandBase';

abstract class CustomCommandBase extends CommandBase implements vscode.Disposable {

    private _customTimeFormatOptions: vscode.QuickPickItem[];
    private readonly _selectOtherFormat = 'Other Format...';
    private _disposables: vscode.Disposable[];

    public constructor(timeConverter: TimeConverter, dialogHandler: DialogHandler) {
        super(timeConverter, dialogHandler);
        this.updateCustomFormats();
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('timing.customFormats')) {
                this.updateCustomFormats();
            }

        }, this, this._disposables);
    }

    public dispose() {
        this._disposables.forEach((disposable) => {
            disposable.dispose();
        });
    }

    protected async getCustomFormat(): Promise<string> {
        let formatFromOptions: vscode.QuickPickItem = { label: this._selectOtherFormat };
        let result;
        if (this._customTimeFormatOptions.length > 1) {
            formatFromOptions = await this._dialogHandler.showOptionsDialog(
                this._customTimeFormatOptions,
                'Select custom source format.');
        }

        if (formatFromOptions) {
            if (formatFromOptions.label === this._selectOtherFormat) {
                result = this._dialogHandler.showInputDialog(
                    'E.g.: YYYY/MM/DD',
                    'Insert custom format.',
                    (input) => input ? true : false,
                    'Ensure you enter a custom momentjs format.'
                );
            } else {
                result =  formatFromOptions.label;
            }
        }

        return result;
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

export { CustomCommandBase };
