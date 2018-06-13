'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';

import { CommandBase } from '../../commands/commandBase';
import { DialogHandler } from '../../dialogHandler';
import { TimeConverter } from '../../timeConverter';

describe('CommandBase', () => {

    class TestObject extends CommandBase {
        public execute() {
            return this.isInputSelected();
        }
    }

    let testEditor: vscode.TextEditor;
    before(async () => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    it('should get the correct preselected time.', () => {
        testEditor.selection = new vscode.Selection(new vscode.Position(3, 32), new vscode.Position(3, 41));
        const testObject = new TestObject(new TimeConverter(), new DialogHandler());

        const result = testObject.execute();

        assert.equal(result, '123456789');
    });

    it('should return selection no matter whether it is a time.', () => {
        testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 4));
        const testObject = new TestObject(new TimeConverter(), new DialogHandler());

        const result = testObject.execute();

        assert.equal(result, 't ');
    });
});
