'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { NowAsCustomCommand } from '../../commands/nowAsCustomCommand';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';
import { TimeConverterMock } from '../mock/TimeConverterMock';

describe('NowAsCustomCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverterMock: TimeConverterMock;
    let testObject: NowAsCustomCommand;
    let testEditor: vscode.TextEditor;

    before(async () => {
        dialogHandlerMock = new DialogHandlerMock();
        timeConverterMock = new TimeConverterMock();
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
            timeConverterMock.reset();
            testObject = new NowAsCustomCommand(undefined, timeConverterMock, dialogHandlerMock);
            timeConverterMock.getNowAsCustom.returns('2018');
        });

        it('Should ask user to choose custom format', async () => {
            dialogHandlerMock.showInputDialog.returns('YYYY');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should stop if user canceled during custom format selection', async () => {
            dialogHandlerMock.showInputDialog.returns(undefined);

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.notCalled, true);
        });

        it('Should show result after calculation', async () => {
            dialogHandlerMock.showInputDialog.returns('YYYY');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(timeConverterMock.getNowAsCustom.calledOnce, true);
        });

        it('Should insert the converted time.', async () => {
            dialogHandlerMock.showInputDialog.returns('YYYY');
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);
            const priorText = testEditor.document.getText(testEditor.selection);
            const spy = sinon.spy(testEditor, 'edit');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
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
