'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { InputBoxStep } from '../../step/inputBoxStep';
import { QuickPickStep } from '../../step/quickPickStep';
import { StepResult } from '../../step/stepResult';
import { InputFlowAction } from '../../util/InputFlowAction';
import { ExtensionContextMock } from '../mock/extensionContextMock';
import { MultiStepHandlerMock } from '../mock/multiStepHandlerMock';

describe('QuickPickStep', () => {
    let testObject: QuickPickStep;
    let testEditor: vscode.TextEditor;
    let inputBoxStepStub: sinon.SinonStubbedInstance<InputBoxStep>;
    let quickPick: vscode.QuickPick<vscode.QuickPickItem>;
    let handlerMock: MultiStepHandlerMock;
    let spy: sinon.SinonSpy;
    let quickPickStub: sinon.SinonStubbedInstance<vscode.QuickPick<vscode.QuickPickItem>>;

    beforeEach(async () => {
        handlerMock = new MultiStepHandlerMock(new ExtensionContextMock());
        const inputBoxStep = new InputBoxStep(
            'test-placeholder',
            'test prompt',
            'test-title',
            'test-validation-message',
            (input: string) => true,
            true);

        inputBoxStepStub = sinon.stub(inputBoxStep);
        spy = sinon.spy(vscode.window, 'createQuickPick');

        testObject = new QuickPickStep(
            'test-placeholder',
            'test-title',
            [{ label: 'test-label' }],
            { label: 'other-item-label' },
            inputBoxStepStub);
        assert.equal(spy.calledOnce, true);

        quickPick = spy.returnValues[0];
        quickPickStub = sinon.stub(quickPick);

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    afterEach(() => {
        spy.restore();
        sinon.reset();
    });

    describe('ctor', () => {
        it('should create an InputBox', () => {
            const result: vscode.QuickPick<vscode.QuickPickItem> = spy.returnValues[0];

            assert.strictEqual(spy.calledOnce, true);
            assert.strictEqual(result.placeholder, 'test-placeholder');
            assert.strictEqual(result.title, 'test-title');
            assert.strictEqual(result.matchOnDescription, true);
            assert.strictEqual(result.matchOnDetail, true);

            spy.restore();
        });
    });

    describe('execute', () => {
        it('should add back button when step greater 1', () => {
            testObject.execute(handlerMock, 2, 2, true);

            assert.strictEqual(quickPickStub.buttons.length, 1);
            assert.strictEqual(quickPickStub.buttons[0], vscode.QuickInputButtons.Back);
        });

        it('should not add back button when step is 1', () => {
            testObject.execute(handlerMock, 1, 2, true);

            assert.strictEqual(quickPickStub.buttons.length, 0);
        });

        it('should add items', () => {
            testObject.execute(handlerMock, 0, 0, true);

            assert.strictEqual(quickPickStub.items.length, 2);
            assert.strictEqual(quickPickStub.items[0].label, 'test-label');
            assert.strictEqual(quickPickStub.items[1].label, 'other-item-label');
        });

        it('should register event listener and show the quick pick.', () => {
            testObject.execute(handlerMock, 0, 0, true);

            assert.strictEqual(quickPickStub.onDidAccept.calledOnce, true);
            assert.strictEqual(quickPickStub.onDidHide.calledOnce, true);
            assert.strictEqual(quickPickStub.onDidTriggerButton.calledOnce, true);
            assert.strictEqual(quickPickStub.show.calledOnce, true);
        });

        it('should set input box step member.', () => {
            testObject.execute(handlerMock, 4, 10, true);

            assert.strictEqual(quickPickStub.step, 4);
            assert.strictEqual(quickPickStub.totalSteps, 10);
            assert.strictEqual(quickPickStub.ignoreFocusOut, true);
        });

        describe('events', () => {

            let listener: (e: any) => any;
            let resultPromise: Thenable<StepResult>;
            beforeEach(() => {
                resultPromise = testObject.execute(handlerMock, 0, 0, true);
            });

            afterEach(() => {
                sinon.reset();
            });

            it('onDidAccept should resolve and return pick.', async () => {
                listener = quickPickStub.onDidAccept.firstCall.args[0];
                assert.strictEqual(quickPickStub.onDidAccept.calledOnce, true);

                listener(undefined);
                assert.strictEqual(quickPickStub.selectedItems.length, 1);
                assert.strictEqual(handlerMock.registerStep.notCalled, true);
                assert.strictEqual(quickPickStub.hide.calledOnce, true);
                const result = await resultPromise;

                assert.strictEqual(result.value, 'test-label');
                assert.strictEqual(result.action, InputFlowAction.Continue);
            });

            // it('onDidAccept should register step.', async () => {
            //     listener = quickPickStub.onDidAccept.firstCall.args[0];
            //     quickPickStub.selectedItems = [{ label: 'other-item-label' }];
            //     assert.strictEqual(quickPickStub.onDidAccept.calledOnce, true);
            //     const dummy: void = undefined;

            //     listener(dummy);
            //     const result = await resultPromise;

            //     assert.strictEqual(registerStepSpy.calledOnce, true);
            //     assert.strictEqual(registerStepSpy.args[0], inputBoxStepStub);
            //     assert.strictEqual(result.value, undefined);
            //     assert.strictEqual(quickPickStub.hide.calledOnce, true);
            //     assert.strictEqual(result.action, InputFlowAction.Continue);
            // });

            it('onDidTriggerBackButton resolve back action.', async () => {
                assert.strictEqual(quickPickStub.onDidTriggerButton.calledOnce, true);
                listener = quickPickStub.onDidTriggerButton.firstCall.args[0];

                listener(vscode.QuickInputButtons.Back);
                const result = await resultPromise;

                assert.strictEqual(result.value, undefined);
                assert.strictEqual(result.action, InputFlowAction.Back);
            });

            it('onDidHide should resolve to cancel action.', async () => {
                listener = quickPickStub.onDidHide.firstCall.args[0];
                assert.strictEqual(quickPickStub.onDidHide.calledOnce, true);
                const dummy: void = undefined;

                listener(dummy);
                const result = await resultPromise;

                assert.strictEqual(result.value, undefined);
                assert.strictEqual(result.action, InputFlowAction.Cancel);
            });
        });
    });

    describe('dispose', () => {
        it('should dispose the quick pick.', () => {
            testObject.dispose();
            assert.strictEqual(quickPickStub.dispose.calledOnce, true);
        });
    });
});
