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
import { CustomToCustomCommand } from '../../commands/customToCustomCommand';
import { StepResult } from '../../step/stepResult';
import { ConfigHelper } from '../../util/configHelper';
import { InputFlowAction } from '../../util/inputFlowAction';
import { ResultBox } from '../../util/resultBox';
import { TimeConverter } from '../../util/timeConverter';
import { ExtensionContextMock } from '../mock/extensionContextMock';
import { MultiStepHandlerMock } from '../mock/multiStepHandlerMock';

describe('CustomToCustomCommand', () => {
    let timeConverter: TimeConverter;
    let testObject: CustomToCustomCommand;
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
            testObject = new CustomToCustomCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());
            testEditor.selection = new vscode.Selection(new vscode.Position(6, 40), new vscode.Position(6, 44));
            handlerMock.run.returns(new Promise(resolve => resolve(['MM/DD/YYYY', '03/20/2018', 'DD-MM-YYYY'])));
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
                timeConverter.customToCustom('MM/DD/YYYY', '03/20/2018', 'DD-MM-YYYY'));
        });

        it('Should start with last step if input flow action is Back.', async () => {
            showResultStub.onFirstCall().returns(new StepResult(InputFlowAction.Back, undefined));
            showResultStub.onSecondCall().returns(new StepResult(InputFlowAction.Cancel, undefined));

            await testObject.execute();

            assert.strictEqual(handlerMock.run.calledTwice, true);
            assert.strictEqual(handlerMock.run.secondCall.args[2], -1);
            showResultStub.resetBehavior();
        });
    });
});
