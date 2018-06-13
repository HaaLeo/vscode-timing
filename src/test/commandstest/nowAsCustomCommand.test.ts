'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { NowAsCustomCommand } from '../../commands/nowAsCustomCommand';
import { DialogHandlerMock } from '../mock/DialogHandlerMock';
import { TimeConverterMock } from '../mock/TimeConverterMock';

describe('NowAsCustomCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverterMock: TimeConverterMock;
    let testObject: NowAsCustomCommand;

    before(async () => {
        dialogHandlerMock = new DialogHandlerMock();
        timeConverterMock = new TimeConverterMock();
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            await vscode.window.showTextDocument(file);
        }
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', []);
    });

    describe('execute', () => {
        beforeEach('Reset', () => {
            dialogHandlerMock.reset();
            timeConverterMock.reset();
            testObject = new NowAsCustomCommand(timeConverterMock, dialogHandlerMock);
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
    });
});
