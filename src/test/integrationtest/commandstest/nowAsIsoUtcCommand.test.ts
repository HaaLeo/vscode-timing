'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { NowAsIsoUtcCommand } from '../../../commands/nowAsIsoUtcCommand';
import { DialogHandlerMock } from '../../mock/DialogHandlerMock';
import { TimeConverterMock } from '../../mock/TimeConverterMock';

describe('NowAsIsoUtcCommand', () => {
    let dialogHandlerMock: DialogHandlerMock;
    let timeConverterMock: TimeConverterMock;
    let testObject: NowAsIsoUtcCommand;

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
            testObject = new NowAsIsoUtcCommand(timeConverterMock, dialogHandlerMock);
            timeConverterMock.getNowAsIsoUtc.returns('1111');
        });

        it('Should show result after calculation', async () => {
            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.calledOnce, true);
            assert.equal(timeConverterMock.getNowAsIsoUtc.calledOnce, true);
        });

        it('Should update the time when hit enter again', async () => {
            dialogHandlerMock.showResultDialog.onFirstCall().returns('1');
            dialogHandlerMock.showResultDialog.onSecondCall().returns(undefined);
            await testObject.execute();

            assert.equal(dialogHandlerMock.showInputDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showOptionsDialog.notCalled, true);
            assert.equal(dialogHandlerMock.showResultDialog.callCount, 2);
            assert.equal(timeConverterMock.getNowAsIsoUtc.callCount, 2);
        });

    });
});
