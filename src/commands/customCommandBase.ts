/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { ConfigHelper } from '../util/configHelper';
import { TimeConverter } from '../util/timeConverter';
import { CommandBase } from './commandBase';
abstract class CustomCommandBase extends CommandBase implements vscode.Disposable {

    protected _customTimeFormatOptions: vscode.QuickPickItem[];

    public constructor(context: vscode.ExtensionContext, timeConverter: TimeConverter, configHelper: ConfigHelper) {
        super(context, timeConverter, configHelper);

        this._configHelper.subscribeToConfig('timing.customFormats', this.updateCustomFormats, this);
    }

    private updateCustomFormats(config: ICustomFormat[]): void {
        this._customTimeFormatOptions = [];
        config.forEach(newFormat => {
            if (newFormat.format) {
                this._customTimeFormatOptions.push({
                    label: newFormat.format,
                    description: newFormat.description,
                    detail: newFormat.detail
                });
            }
        });

        if (this._stepHandler) {
            this._stepHandler.updateFormats(this._customTimeFormatOptions);
        }
    }
}

export { CustomCommandBase };
