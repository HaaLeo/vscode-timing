'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';

import { CustomCommandBase } from '../../commands/customCommandBase';
import { TimeConverter } from '../../util/timeConverter';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';
import { ExtensionContextMock } from '../mock/extensionContextMock';

describe('CustomCommandBase', () => {

    class TestObject extends CustomCommandBase {
        public async execute() {
            return this.getCustomFormat();
        }
    }

    before(async () => {
        let file: vscode.TextDocument;
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            file = await vscode.workspace.openTextDocument(uris[0]);
            await vscode.window.showTextDocument(file);
        }
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', undefined);
    });

    it('should return undefined when user cancels during format insertion', async () => {
        const config = vscode.workspace.getConfiguration('timing');
        const dialogHandlerMock = new DialogHandlerMock();
        dialogHandlerMock.showInputDialog.returns(undefined);
        const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter(), dialogHandlerMock);
        await config.update('customFormats', []);

        const result = await testObject.execute();

        assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
        assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
        assert.equal(result, undefined);
    });

    it('should return the format the user inserted', async () => {
        const config = vscode.workspace.getConfiguration('timing');
        const dialogHandlerMock = new DialogHandlerMock();
        dialogHandlerMock.showInputDialog.returns('Test Format');
        const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter(), dialogHandlerMock);
        await config.update('customFormats', []);

        const result = await testObject.execute();

        assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
        assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
        assert.equal(result, 'Test Format');
    });

    it('should return users format selection', async () => {
        const config = vscode.workspace.getConfiguration('timing');
        const dialogHandlerMock = new DialogHandlerMock();
        dialogHandlerMock.showOptionsDialog.returns({label: 'Test Format'});
        const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter(), dialogHandlerMock);
        await config.update('customFormats', [{format: 'not evaluated'}]);

        const result = await testObject.execute();

        assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
        assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
        assert.equal(result, 'Test Format');
    });

    it('should should update format options when configuration is updated.', async () => {
        const config = vscode.workspace.getConfiguration('timing');
        const dialogHandlerMock = new DialogHandlerMock();
        dialogHandlerMock.showOptionsDialog.returns(undefined);
        const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter(), dialogHandlerMock);
        await config.update('customFormats', [{format: 'first'}, {format: 'second'}]);

        await testObject.execute();

        assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
        assert.equal(JSON.stringify(dialogHandlerMock.showOptionsDialog.args[0][0]),
            JSON.stringify([{label: 'first'}, {label: 'second'}, {label: 'Other Format...'}]));
    });
});
