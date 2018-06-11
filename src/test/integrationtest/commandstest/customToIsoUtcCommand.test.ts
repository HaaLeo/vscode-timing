'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { CustomToIsoUtcCommand } from '../../../commands/customToIsoUtcCommand';
import { TimeConverter } from '../../../timeConverter';
import { DialogHandlerMock } from '../../mock/DialogHandlerMock';

describe('CustomToIsoUtcCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverter: TimeConverter;
    let testObject: CustomToIsoUtcCommand;
    let testEditor: vscode.TextEditor;

    before(async () => {
        dialogHandlerMock = new DialogHandlerMock();
        timeConverter = new TimeConverter();
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
            dialogHandlerMock.showInputDialog.returns('YYYY');
            testObject = new CustomToIsoUtcCommand(timeConverter, dialogHandlerMock);
        });

        it('Should stop if selected custom format is invalid.', async () => {
            dialogHandlerMock.showInputDialog.returns(undefined);

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.notCalled, true);
        });

        it('Should not ask for user input if pre selection is valid custom date', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should ask for user input if pre selection is invalid custom date', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should show result after calculation', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(
                dialogHandlerMock.showResultDialog.args[0][1],
                'Result: ' + timeConverter.customToIsoUtc('2018', 'YYYY'));
        });
    });
});