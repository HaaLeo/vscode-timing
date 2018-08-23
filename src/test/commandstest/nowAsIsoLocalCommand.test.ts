'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { NowAsIsoLocalCommand } from '../../commands/nowAsIsoLocalCommand';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';
import { ExtensionContextMock } from '../mock/extensionContextMock';
import { TimeConverterMock } from '../mock/TimeConverterMock';

describe('NowAsIsoLocalCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverterMock: TimeConverterMock;
    let testObject: NowAsIsoLocalCommand;
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
            testObject = new NowAsIsoLocalCommand(new ExtensionContextMock(), timeConverterMock, dialogHandlerMock);
            timeConverterMock.getNowAsIsoLocal.returns('1111');
        });

        it('Should show result after calculation', async () => {
            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(timeConverterMock.getNowAsIsoLocal.calledOnce, true);
        });

        it('Should update the time when hit enter again', async () => {
            dialogHandlerMock.showResultDialog.onFirstCall().returns('1');
            dialogHandlerMock.showResultDialog.onSecondCall().returns(undefined);
            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.callCount, 2);
            assert.equal(timeConverterMock.getNowAsIsoLocal.callCount, 2);
        });

        it('Should insert the converted time.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);
            const priorText = testEditor.document.getText(testEditor.selection);
            const spy = sinon.spy(testEditor, 'edit');

            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
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
