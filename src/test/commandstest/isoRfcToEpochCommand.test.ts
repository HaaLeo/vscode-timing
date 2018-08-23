'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { IsoRfcToEpochCommand } from '../../commands/isoRfcToEpochCommand';
import { TimeConverter } from '../../util/timeConverter';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';
import { ExtensionContextMock } from '../mock/extensionContextMock';

describe('IsoRfcToEpochCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverter: TimeConverter;
    let testObject: IsoRfcToEpochCommand;
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
            testObject = new IsoRfcToEpochCommand(new ExtensionContextMock(), timeConverter, dialogHandlerMock);
            testEditor.selection = new vscode.Selection(new vscode.Position(4, 31), new vscode.Position(4, 55));
            dialogHandlerMock.showOptionsDialog.returns({ label: 'ms' });
        });

        it('Should not ask for user input if pre selection is valid iso date', async () => {

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should ask for user input if pre selection is invalid epoch', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(5, 0), new vscode.Position(5, 0));
            dialogHandlerMock.showInputDialog.returns('2018-05-03');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should stop if user canceled during iso time insertion', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(5, 0), new vscode.Position(5, 0));
            dialogHandlerMock.showInputDialog.returns(undefined);

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.notCalled, true);
        });

        it('Should stop if canceled during epoch format selection.', async () => {
            dialogHandlerMock.showOptionsDialog.returns(undefined);

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.notCalled, true);
        });

        it('Should show result after calculation', async () => {
            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(
                dialogHandlerMock.showResultDialog.args[0][1],
                'Result: ' + timeConverter.isoRfcToEpoch('2018-06-03T10:32:57.000Z', 'ms') + ' (ms)');
        });

        it('Should insert the converted time.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);
            const priorText = testEditor.document.getText(testEditor.selection);
            const spy = sinon.spy(testEditor, 'edit');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
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
