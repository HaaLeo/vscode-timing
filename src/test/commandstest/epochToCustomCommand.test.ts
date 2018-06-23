'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { EpochToCustomCommand } from '../../commands/epochToCustomCommand';
import { TimeConverter } from '../../timeConverter';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';

describe('EpochToCustomCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let testObject: EpochToCustomCommand;
    let testEditor: vscode.TextEditor;

    before(async () => {
        dialogHandlerMock = new DialogHandlerMock();
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', []);
    });

    describe('execute', () => {
        beforeEach('Reset', () => {
            dialogHandlerMock.reset();
            testObject = new EpochToCustomCommand(new TimeConverter(), dialogHandlerMock);
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 32), new vscode.Position(3, 41));
        });

        it('Should not ask for user input if pre selection is valid epoch date', async () => {
            dialogHandlerMock.showInputDialog.returns('YYYY');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should ask for user input if pre selection is invalid epoch', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(5, 0), new vscode.Position(5, 0));
            dialogHandlerMock.showInputDialog.onFirstCall().returns('2018000');
            dialogHandlerMock.showInputDialog.onSecondCall().returns('YYYY');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.callCount, 2);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should stop if user canceled during epoch time insertion', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(5, 0), new vscode.Position(5, 0));
            dialogHandlerMock.showInputDialog.returns(undefined);

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.notCalled, true);
        });

        it('Should stop if selected custom format is invalid.', async () => {
            dialogHandlerMock.showInputDialog.returns(undefined);

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.notCalled, true);
        });

        it('Should show result after calculation', async () => {
            dialogHandlerMock.showInputDialog.returns('YYYY/MM/DD');
            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.args[0][1], 'Result: 1973/11/29');
        });
    });
});