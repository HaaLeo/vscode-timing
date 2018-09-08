/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { TimeConverter } from '../util/timeConverter';
import { CommandBase } from './commandBase';

abstract class CustomCommandBase extends CommandBase implements vscode.Disposable {

    protected _customTimeFormatOptions: vscode.QuickPickItem[];

    public constructor(context: vscode.ExtensionContext, timeConverter: TimeConverter) {
        super(context, timeConverter);
        this.updateCustomFormats();
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('timing.customFormats')) {
                this.updateCustomFormats();
            }

        }, this, this._disposables);
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
    }
}

export { CustomCommandBase };
