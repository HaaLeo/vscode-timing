'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { NowAsEpochCommand } from '../../../commands/nowAsEpochCommand';
import { DialogHandlerMock } from '../../mock/DialogHandlerMock';
import { TimeConverterMock } from '../../mock/TimeConverterMock';

describe('NowAsEpochCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverterMock: TimeConverterMock;
    let testObject: NowAsEpochCommand;

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
            testObject = new NowAsEpochCommand(timeConverterMock, dialogHandlerMock);
            dialogHandlerMock.showOptionsDialog.returns({ label: 'ms' });
            timeConverterMock.getNowAsEpoch.returns('1111');
        });

        it('Should ask user to choose epoch format', async () => {
            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.calledOnce, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
        });

        it('Should stop if user canceled during epoch format selection', async () => {
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
            assert.equal(timeConverterMock.getNowAsEpoch.calledOnce, true);
        });
    });
});
