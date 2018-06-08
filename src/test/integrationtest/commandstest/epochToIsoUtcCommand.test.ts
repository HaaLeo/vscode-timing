'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

suite('epochToIsoUtc', () => {

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

    test('should calculate result directly and show result view.', () => {
        testEditor.selection = new vscode.Selection(new vscode.Position(3, 32), new vscode.Position(3, 41));
        const spy = sinon.spy(vscode.window, 'showInputBox');
        vscode.commands.executeCommand('timing.epochToIsoUtc');
        assert.equal(true, spy.calledOnce);
        assert.equal(
            JSON.stringify({
                placeHolder: '123456789',
                value: 'Result: 1973-11-29T21:33:09.000Z',
                valueSelection: ['Result: '.length, 'Result: '.length + '1973-11-29T21:33:09.000Z'.length],
                prompt: 'Input: 123456789 (s)'
            }),
            JSON.stringify(spy.args[0][0]));
        spy.restore();
    });
});
