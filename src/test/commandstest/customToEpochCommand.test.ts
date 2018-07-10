'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CustomToEpochCommand } from '../../commands/customToEpochCommand';
import { TimeConverter } from '../../timeConverter';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';

describe('CustomToEpochCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverter: TimeConverter;

    let testObject: CustomToEpochCommand;
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

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', undefined);
        await config.update('insertConvertedTime', undefined);
    });

    describe('execute', () => {
        beforeEach('Reset', () => {
            dialogHandlerMock.reset();
            dialogHandlerMock.showInputDialog.returns('YYYY');
            testObject = new CustomToEpochCommand(timeConverter, dialogHandlerMock);
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
            dialogHandlerMock.showOptionsDialog.returns({ label: 'ms' });

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should ask for user input if pre selection is invalid custom date', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));
            dialogHandlerMock.showOptionsDialog.returns({ label: 'ms' });
            dialogHandlerMock.showInputDialog.returns('2018');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.callCount, 2);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should stop if user canceled during target unit selection', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));
            dialogHandlerMock.showOptionsDialog.returns(undefined);

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, false);
        });

        it('Should show result after calculation', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));
            dialogHandlerMock.showOptionsDialog.returns({ label: 'ms' });

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(
                dialogHandlerMock.showResultDialog.args[0][1],
                'Result: ' + timeConverter.customToEpoch('2018', 'YYYY', 'ms') + ' (ms)');
        });

        it('Should insert the converted time.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));
            const priorText = testEditor.document.getText(testEditor.selection);
            dialogHandlerMock.showOptionsDialog.returns({ label: 'ms' });
            const spy = sinon.spy(testEditor, 'edit');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(spy.calledOnce, true);

            // Restore
            const success = await testEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                editBuilder.replace(testEditor.selection, priorText);
            });
            assert.equal(success, true);
            spy.restore();
        });
    });
});
