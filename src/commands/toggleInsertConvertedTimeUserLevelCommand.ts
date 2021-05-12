/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';

class ToggleInsertConvertedTimeUserLevelCommand {
    public async execute(): Promise<void> {
        const config = vscode.workspace.getConfiguration('timing');
        const newValue: boolean = !config.get('insertConvertedTime');

        await config.update('insertConvertedTime', newValue, vscode.ConfigurationTarget.Global);
        void vscode.window.showInformationMessage(
            (newValue ? 'Enabled' : 'Disabled') + ' inserting converted times.');
    }
}

export { ToggleInsertConvertedTimeUserLevelCommand };
