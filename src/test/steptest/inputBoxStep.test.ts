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
import { InputBoxStep } from '../../step/inputBoxStep';
import { MultiStepHandler } from '../../step/multiStepHandler';
import { StepResult } from '../../step/stepResult';
import { InputFlowAction } from '../../util/inputFlowAction';
import { MultiStepHandlerMock } from '../mock/multiStepHandlerMock';

describe('InputBoxStep', () => {
    let testObject: InputBoxStep;
    let handlerMock: MultiStepHandlerMock;
    let spy: sinon.SinonSpy;
    let inputBoxStub: sinon.SinonStubbedInstance<vscode.InputBox>;

    before(() => {
        handlerMock = new MultiStepHandlerMock();
    });

    after(() => {
        handlerMock.restore();
    });

    beforeEach(async () => {
        spy = sinon.spy(vscode.window, 'createInputBox');
        testObject = new InputBoxStep(
            'test-placeholder',
            'test-prompt',
            'test-title',
            'test-validation-message',
            () => true);
        assert.strictEqual(spy.calledOnce, true);

        const inputBox: vscode.InputBox = spy.returnValues[0];
        inputBoxStub = sinon.stub(inputBox);

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            await vscode.window.showTextDocument(file);
        }
    });

    afterEach(() => {
        spy.restore();
        sinon.reset();
    });

    describe('ctor', () => {
        it('should create an InputBox', () => {

            const result: vscode.InputBox = spy.returnValues[0];

            assert.strictEqual(spy.calledOnce, true);
            assert.strictEqual(result.validationMessage, '');
            assert.strictEqual(result.ignoreFocusOut, true);

            spy.restore();
        });
    });

    describe('execute', () => {
        it('should add back button when step greater 1', () => {
            testObject.execute(new MultiStepHandler(), 2, 2, true);

            assert.strictEqual(inputBoxStub.buttons.length, 1);
            assert.strictEqual(inputBoxStub.buttons[0], vscode.QuickInputButtons.Back);
        });

        it('should not add back button when step is 1', () => {
            testObject.execute(new MultiStepHandler(), 1, 2, true);

            assert.strictEqual(inputBoxStub.buttons.length, 0);
        });

        it('should register event listener and show the input box.', () => {
            testObject.execute(new MultiStepHandler(), 0, 0, true);

            assert.strictEqual(inputBoxStub.onDidAccept.calledOnce, true);
            assert.strictEqual(inputBoxStub.onDidChangeValue.calledOnce, true);
            assert.strictEqual(inputBoxStub.onDidHide.calledOnce, true);
            assert.strictEqual(inputBoxStub.onDidTriggerButton.calledOnce, true);
            assert.strictEqual(inputBoxStub.show.calledOnce, true);
        });

        it('should set input box step member.', () => {
            testObject.execute(new MultiStepHandler(), 4, 10, true);

            assert.strictEqual(inputBoxStub.step, 4);
            assert.strictEqual(inputBoxStub.totalSteps, 10);
            assert.strictEqual(inputBoxStub.placeholder, 'test-placeholder');
            assert.strictEqual(inputBoxStub.prompt, 'test-prompt');
            assert.strictEqual(inputBoxStub.title, 'test-title');
        });

        describe('validation succeeds', () => {

            let listener: (e: any) => any;
            let resultPromise: Thenable<StepResult>;
            beforeEach(() => {
                resultPromise = testObject.execute(new MultiStepHandler(), 0, 0, true);
            });

            afterEach(() => {
                sinon.reset();
            });

            it('onDidAccept should resolve if input validation succeeded.', async () => {
                inputBoxStub.value = '5555';
                listener = inputBoxStub.onDidAccept.firstCall.args[0];
                assert.strictEqual(inputBoxStub.onDidAccept.calledOnce, true);
                const dummy: void = undefined;

                listener(dummy);
                const result = await resultPromise;

                assert.strictEqual(result.value, '5555');
                assert.strictEqual(result.action, InputFlowAction.Continue);
            });

            it('onDidChangeValue should take back validation message if input validation succeeded.', () => {
                listener = inputBoxStub.onDidChangeValue.firstCall.args[0];
                assert.strictEqual(inputBoxStub.onDidChangeValue.calledOnce, true);

                listener('not evaluated');

                assert.strictEqual(inputBoxStub.validationMessage, '');
            });

            it('onDidHide should resolve to cancel action.', async () => {
                listener = inputBoxStub.onDidHide.firstCall.args[0];
                assert.strictEqual(inputBoxStub.onDidHide.calledOnce, true);
                const dummy: void = undefined;

                listener(dummy);
                const result = await resultPromise;

                assert.strictEqual(result.value, undefined);
                assert.strictEqual(result.action, InputFlowAction.Cancel);
            });
        });

        describe('validation fails', () => {
            let listener: (e: any) => any;

            beforeEach(() => {
                spy.resetHistory();
                testObject = new InputBoxStep(
                    'test-placeholder',
                    'test-prompt',
                    'test-title',
                    'test-validation-message',
                    () => false,
                    false,
                    true);
                assert.strictEqual(spy.calledOnce, true);
                const inputBox: vscode.InputBox = spy.returnValues[0];
                inputBoxStub = sinon.stub(inputBox);
                testObject.execute(new MultiStepHandler(), 0, 0, true);
                assert.strictEqual(inputBoxStub.onDidAccept.calledOnce, true);
                assert.strictEqual(inputBoxStub.ignoreFocusOut, true);
                listener = inputBoxStub.onDidAccept.firstCall.args[0];
            });

            afterEach(() => {
                sinon.reset();
            });

            it('onDidAccept should show the validation message if input validation fails.', () => {
                assert.strictEqual(inputBoxStub.onDidAccept.calledOnce, true);
                listener = inputBoxStub.onDidAccept.firstCall.args[0];
                const dummy: void = undefined;

                listener(dummy);

                assert.strictEqual(inputBoxStub.validationMessage, 'test-validation-message');
            });

            it('onDidChange should show the validation message if input validation fails.', () => {
                assert.strictEqual(inputBoxStub.onDidChangeValue.calledOnce, true);
                listener = inputBoxStub.onDidChangeValue.firstCall.args[0];

                listener('not evaluated');

                assert.strictEqual(inputBoxStub.validationMessage, 'test-validation-message');
            });

            it('onDidTriggerBackButton should unregister and resolve back action.', async () => {
                sinon.reset();
                const resultPromise = testObject.execute(new MultiStepHandler(), 0, 0, true);

                assert.strictEqual(inputBoxStub.onDidTriggerButton.calledOnce, true);
                listener = inputBoxStub.onDidTriggerButton.firstCall.args[0];

                listener(vscode.QuickInputButtons.Back);
                const result = await resultPromise;

                assert.strictEqual(result.value, undefined);
                assert.strictEqual(result.action, InputFlowAction.Back);
                assert.strictEqual(handlerMock.unregisterStep.calledOnce, true);
                assert.strictEqual(handlerMock.unregisterStep.firstCall.args[0], testObject);
            });
        });
    });

    describe('reset', () => {
        it('should reset the input box\'s value', () => {
            testObject.reset();
            assert.strictEqual(inputBoxStub.value, '');
        });
    });

    describe('dispose', () => {
        it('should dispose the input box.', () => {
            testObject.dispose();
            assert.strictEqual(inputBoxStub.dispose.calledOnce, true);
        });
    });
});
