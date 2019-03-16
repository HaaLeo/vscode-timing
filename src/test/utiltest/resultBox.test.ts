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
import { StepResult } from '../../step/stepResult';
import { InputFlowAction } from '../../util/InputFlowAction';
import { ResultBox } from '../../util/resultBox';

describe('ResultBox', () => {
    let testObject: ResultBox;
    const insertButtonMock: vscode.QuickInputButton = {
        iconPath: 'my-icon-path'
    };

    const insertMock = sinon.stub();

    beforeEach(async () => {
        testObject = new ResultBox(insertButtonMock);
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            await vscode.window.showTextDocument(file);
        }
    });

    describe('ctor', () => {
        it('should create an InputBox', () => {
            const spy = sinon.spy(vscode.window, 'createInputBox');

            testObject = new ResultBox(insertButtonMock);
            const result: vscode.InputBox = spy.returnValues[0];

            assert.strictEqual(spy.calledOnce, true);
            assert.strictEqual(result.validationMessage, '');
            assert.strictEqual(result.ignoreFocusOut, true);

            spy.restore();
        });
    });

    describe('show', () => {
        let spy: sinon.SinonSpy;
        let resultBoxStub: sinon.SinonStubbedInstance<vscode.InputBox>;

        beforeEach(() => {
            spy = sinon.spy(vscode.window, 'createInputBox');
            testObject = new ResultBox(insertButtonMock);
            assert.strictEqual(spy.calledOnce, true);

            const resultBox: vscode.InputBox = spy.returnValues[0];
            resultBoxStub = sinon.stub(resultBox);
        });

        afterEach(() => {
            spy.restore();
            sinon.reset();
        });

        it('should add back button and insert button', () => {
            testObject.show('', '', '', insertMock, true);

            assert.strictEqual(resultBoxStub.buttons.length, 2);
            assert.strictEqual(resultBoxStub.buttons[0], vscode.QuickInputButtons.Back);
        });

        it('should set title, value and prompt', () => {
            testObject.show('test-prompt', 'test-title', 'test-value', insertMock, true);

            assert.strictEqual(resultBoxStub.prompt, 'test-prompt');
            assert.strictEqual(resultBoxStub.title, 'test-title');
            assert.strictEqual(resultBoxStub.value, 'test-value');
        });

        it('should register event listener and show the input box.', () => {
            testObject.show('', '', '', insertMock, true);

            assert.strictEqual(resultBoxStub.onDidAccept.calledOnce, true);
            assert.strictEqual(resultBoxStub.onDidHide.calledOnce, true);
            assert.strictEqual(resultBoxStub.onDidTriggerButton.calledOnce, true);
            assert.strictEqual(resultBoxStub.show.calledOnce, true);
        });

        describe('events', () => {

            let listener: (e: any) => any;
            let resultPromise: Thenable<StepResult>;
            beforeEach(() => {
                resultPromise = testObject.show('test-prompt', 'test-title', 'test-value', insertMock, true);
            });

            afterEach(() => {
                sinon.reset();
            });

            it('onDidAccept should resolve to continue action.', async () => {
                resultBoxStub.value = '5555';
                listener = resultBoxStub.onDidAccept.firstCall.args[0];
                assert.strictEqual(resultBoxStub.onDidAccept.calledOnce, true);
                const dummy: void = undefined;

                listener(dummy);
                const result = await resultPromise;

                assert.strictEqual(result.value, undefined);
                assert.strictEqual(result.action, InputFlowAction.Continue);
            });

            it('onDidHide should resolve to cancel action.', async () => {
                listener = resultBoxStub.onDidHide.firstCall.args[0];
                assert.strictEqual(resultBoxStub.onDidHide.calledOnce, true);
                const dummy: void = undefined;

                listener(dummy);
                const result = await resultPromise;

                assert.strictEqual(result.value, undefined);
                assert.strictEqual(result.action, InputFlowAction.Cancel);
            });

            it('onDidTriggerButton should invoke insert action.', async () => {
                assert.strictEqual(resultBoxStub.onDidTriggerButton.calledOnce, true);
                listener = resultBoxStub.onDidTriggerButton.firstCall.args[0];

                await listener(insertButtonMock);

                assert.strictEqual(insertMock.callCount, 1);
            });

            it('onDidTriggerButton should resolve back action.', async () => {
                assert.strictEqual(resultBoxStub.onDidTriggerButton.calledOnce, true);
                listener = resultBoxStub.onDidTriggerButton.firstCall.args[0];

                await listener(vscode.QuickInputButtons.Back);
                const result = await resultPromise;

                assert.strictEqual(result.value, undefined);
                assert.strictEqual(result.action, InputFlowAction.Back);
            });
        });
    });
});
