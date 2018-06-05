'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { TimeConverter } from '../../timeConverter';
import { TimeHoverProvider } from '../../timeHoverProvider';

suite('TimeHoverProvider', () => {

    let testEditor: vscode.TextEditor;
    suiteSetup(async () => {
        const ext = vscode.extensions.getExtension('HaaLeo.timing');
        if (!ext.isActive) {
            await ext.activate();
        }

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    test('should provide correct hover message.', async () => {
        const results = await vscode.commands.executeCommand(
            'vscode.executeHoverProvider',
            testEditor.document.uri,
            new vscode.Position(3, 32)) as vscode.Hover[];

        assert.equal(
            (results[0].contents[0] as { language: string; value: string }).value,
            '*Epoch Unit*: `s`  \n*UTC*: `1973-11-29T21:33:09.000Z`');
    });
});
