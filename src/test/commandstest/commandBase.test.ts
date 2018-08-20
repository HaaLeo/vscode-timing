'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';

import { CommandBase } from '../../commands/commandBase';
import { DialogHandler } from '../../dialogHandler';
import { TimeConverter } from '../../util/timeConverter';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';

describe('CommandBase', () => {

    class TestObject extends CommandBase {
        public execute(): string {
            return this.isInputSelected();
        }

        public insert(arg: string): Thenable<boolean> {
            return super.insert(arg);
        }

        public get insertConvertedTime(): boolean {
            return this._insertConvertedTime;
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

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('insertConvertedTime', undefined);
    });

    describe('isInputSelected', () => {
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

    describe('config', () => {
        it('should should update insert option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            const dialogHandlerMock = new DialogHandlerMock();
            const testObject = new TestObject(new TimeConverter(), dialogHandlerMock);

            await config.update('insertConvertedTime', true);

            assert.equal(testObject.insertConvertedTime, true);
        });

        it('should should set insert option to false when configuration is undefined.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            const dialogHandlerMock = new DialogHandlerMock();
            const testObject = new TestObject(new TimeConverter(), dialogHandlerMock);

            await config.update('insertConvertedTime', undefined);

            assert.equal(testObject.insertConvertedTime, false);
        });
    });

    describe('insert', () => {
        let testObject: TestObject;

        beforeEach(async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);

            testObject = new TestObject(new TimeConverter(), new DialogHandler());
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 4));
        });

        it('should insert at the cursor selection', async () => {
            const priorText = testObject.execute();

            let success = await testObject.insert('test arg');
            const insertedText = testEditor.document.getText(testEditor.selection);

            assert.equal(success, true);
            assert.equal(insertedText, 'test arg');

            // Restore
            success = await testEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                editBuilder.replace(testEditor.selection, priorText);
            });
            assert.equal(success, true);
        });
    });
});
