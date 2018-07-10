'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { ToggleInsertConvertedTimeUserLevelCommand } from '../../commands/toggleInsertConvertedTimeUserLevelCommand';

describe('ToggleInsertConvertedTimeUserLevelCommand', () => {
    let testObject: ToggleInsertConvertedTimeUserLevelCommand;

    before(async () => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            await vscode.window.showTextDocument(file);
        }
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', undefined);
    });

    describe('execute', () => {
        beforeEach('Reset', async () => {
            testObject = new ToggleInsertConvertedTimeUserLevelCommand();
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', undefined, vscode.ConfigurationTarget.Workspace);
        });

        it('Should toggle setting to true', async () => {
            let config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', false, vscode.ConfigurationTarget.Global);

            await testObject.execute();

            config = vscode.workspace.getConfiguration('timing');
            const result = config.get('insertConvertedTime');
            assert.equal(result, true);
        });

        it('Should toggle setting to false', async () => {
            let config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true, vscode.ConfigurationTarget.Global);

            await testObject.execute();

            config = vscode.workspace.getConfiguration('timing');
            const result = config.get('insertConvertedTime');
            assert.equal(result, false);
        });
    });
});
