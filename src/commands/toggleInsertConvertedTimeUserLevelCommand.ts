'use strict';

import * as vscode from 'vscode';

class ToggleInsertConvertedTimeUserLevelCommand {
    public async execute() {
        const config = vscode.workspace.getConfiguration('timing');
        const newValue: boolean = !config.get('insertConvertedTime');

        await config.update('insertConvertedTime', newValue, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(
            (newValue ? 'Enabled' : 'Disabled') + ' inserting converted times.');
    }
}

export { ToggleInsertConvertedTimeUserLevelCommand };
