'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import TimeConverter = require('../../timeconverter');
import TimeHoverProvider = require('../../timehoverprovider');

suite('TimeHoverProvider', () => {

    let testEditor: vscode.TextEditor;
    setup( async () => {
        const ext = vscode.extensions.getExtension('HaaLeo.timing');
        if (!ext.isActive) {
            await ext.activate();
        }

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.txt');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    test('should provide correct hover message.', async () => {
        const results = await vscode.commands.executeCommand(
            'vscode.executeHoverProvider',
            testEditor.document.uri,
            new vscode.Position(3, 32)) as vscode.Hover[];

        const i = 3;
        assert.equal(
            (results[0].contents[0] as { language: string; value: string }).value,
            '*Epoch Unit*: `s`\n*UTC*: `1973-11-29T21:33:09.000Z`');
    });
});
