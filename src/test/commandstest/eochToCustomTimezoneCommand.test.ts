/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { EpochToCustomTimezoneCommand } from '../../commands/epochToCustomTimezoneCommand';
import { StepResult } from '../../step/stepResult';
import { ConfigHelper } from '../../util/configHelper';
import { InputFlowAction } from '../../util/inputFlowAction';
import { ResultBox } from '../../util/resultBox';
import { TimeConverter } from '../../util/timeConverter';
import { ExtensionContextMock } from '../mock/extensionContextMock';
import { MultiStepHandlerMock } from '../mock/multiStepHandlerMock';

describe('EpochToCustomTimezoneCommand', () => {
    let timeConverter: TimeConverter;
    let testObject: EpochToCustomTimezoneCommand;
    let testEditor: vscode.TextEditor;
    let handlerMock: MultiStepHandlerMock;
    let showResultStub: sinon.SinonStub;

    before(async () => {
        handlerMock = new MultiStepHandlerMock();
        timeConverter = new TimeConverter();
        showResultStub = sinon.stub(ResultBox.prototype, 'show');

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
        await config.update('ignoreFocusOut', undefined);
        await config.update('hideResultViewOnEnter', undefined);
        showResultStub.restore();
        handlerMock.restore();
    });

    describe('execute', () => {
        beforeEach('Reset', () => {
            testObject = new EpochToCustomTimezoneCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 32), new vscode.Position(3, 41));
            handlerMock.run.returns(new Promise(resolve => resolve(['123456789', 'DD.MM.YYYY HH:mm:ss', '-05:00'])));
            showResultStub.returns(new StepResult(InputFlowAction.Cancel, undefined));
        });

        afterEach(() => {
            handlerMock.reset();
            showResultStub.resetHistory();
        });

        it('Should stop if user canceled during epoch time insertion', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(5, 0), new vscode.Position(5, 0));
            handlerMock.run.returns(new Promise(resolve => resolve([])));

            await testObject.execute();

            assert.strictEqual(handlerMock.run.calledOnce, true);
            assert.strictEqual(handlerMock.registerStep.calledThrice, true);
            assert.strictEqual(showResultStub.notCalled, true);
        });

        it('Should show result after calculation', async () => {
            await testObject.execute();

            assert.strictEqual(handlerMock.run.calledOnce, true);
            assert.strictEqual(handlerMock.registerStep.calledThrice, true);
            assert.strictEqual(showResultStub.calledOnce, true);
            assert.strictEqual(
                showResultStub.args[0][2],
                '29.11.1973 16:33:09');
        });

        it('Should start with last step if input flow action is Back.', async () => {
            showResultStub.onFirstCall().returns(new StepResult(InputFlowAction.Back, undefined));
            showResultStub.onSecondCall().returns(new StepResult(InputFlowAction.Cancel, undefined));

            await testObject.execute();

            assert.strictEqual(handlerMock.run.calledTwice, true);
            assert.strictEqual(handlerMock.run.secondCall.args[2], -1);
            showResultStub.resetBehavior();
        });

        it('Should set stephandler result if timezone argument is provided.', async () => {
            await testObject.execute({ timezone: 'Europe/Berlin', targetFormat: 'myTargetFormat' });

            assert.strictEqual(handlerMock.setStepResult.calledTwice, true);
            assert.strictEqual(handlerMock.setStepResult.calledWithExactly('myTargetFormat', 1), true);
            assert.strictEqual(handlerMock.setStepResult.calledWithExactly('Europe/Berlin', 2), true);
        });
    });
});
