'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { InputBoxStep } from '../../step/InputBoxStep';
import { MultiStepHandler } from '../../step/MultiStepHandler';
import { QuickPickStep } from '../../step/QuickPickStep';
import { StepResult } from '../../step/StepResult';
import { InputFlowAction } from '../../util/InputFlowAction';

describe('QuickPickStep', () => {
    let testObject: QuickPickStep;
    let testEditor: vscode.TextEditor;
    let inputBoxStepStub: sinon.SinonStubbedInstance<InputBoxStep>;
    let quickPick: vscode.QuickPick<vscode.QuickPickItem>;

    beforeEach(async () => {
        const inputBoxStep = new InputBoxStep(
            'test-placeholder',
            'test prompt',
            'test-title',
            'test-validation-message',
            (input: string) => true);

        inputBoxStepStub = sinon.stub(inputBoxStep);
        testObject = new QuickPickStep(
            'test-placeholder',
            'test-title',
            [{ label: 'test-label' }],
            { label: 'other-item-label' },
            inputBoxStepStub);
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    describe('ctor', () => {
        it('should create an InputBox', () => {
            const spy = sinon.spy(vscode.window, 'createQuickPick');
            testObject = new QuickPickStep(
                'test-placeholder',
                'test-title',
                [{ label: 'test-label' }],
                { label: 'other-item-label' },
                inputBoxStepStub);
            const result: vscode.QuickPick<vscode.QuickPickItem> = spy.returnValues[0];

            assert.strictEqual(spy.calledOnce, true);
            assert.strictEqual(result.placeholder, 'test-placeholder');
            assert.strictEqual(result.title, 'test-title');
            assert.strictEqual(result.matchOnDescription, true);
            assert.strictEqual(result.matchOnDetail, true);
            assert.strictEqual(result.ignoreFocusOut, true);

            spy.restore();
        });
    });

    describe('execute', () => {
        let spy: sinon.SinonSpy;
        let quickPickStub: sinon.SinonStubbedInstance<vscode.QuickPick<vscode.QuickPickItem>>;

        beforeEach(() => {
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
        });

        afterEach(() => {
            spy.restore();
            sinon.reset();
        });

        it('should add back button when step greater 1', () => {
            testObject.execute(new MultiStepHandler(), 2, 2);

            assert.strictEqual(quickPickStub.buttons.length, 1);
            assert.strictEqual(quickPickStub.buttons[0], vscode.QuickInputButtons.Back);
        });

        it('should not add back button when step is 1', () => {
            testObject.execute(new MultiStepHandler(), 1, 2);

            assert.strictEqual(quickPickStub.buttons.length, 0);
        });

        it('should add items', () => {
            testObject.execute(new MultiStepHandler(), 0, 0);

            assert.strictEqual(quickPickStub.items.length, 2);
            assert.strictEqual(quickPickStub.items[0].label, 'test-label');
            assert.strictEqual(quickPickStub.items[1].label, 'other-item-label');
        });

        it('should register event listener and show the quick pick.', () => {
            testObject.execute(new MultiStepHandler(), 0, 0);

            assert.strictEqual(quickPickStub.onDidAccept.calledOnce, true);
            assert.strictEqual(quickPickStub.onDidHide.calledOnce, true);
            assert.strictEqual(quickPickStub.onDidTriggerButton.calledOnce, true);
            assert.strictEqual(quickPickStub.show.calledOnce, true);
        });

        it('should set input box step member.', () => {
            testObject.execute(new MultiStepHandler(), 4, 10);

            assert.strictEqual(quickPickStub.step, 4);
            assert.strictEqual(quickPickStub.totalSteps, 10);
        });

        describe('events', () => {

            let listener: (e: any) => any;
            let resultPromise: Thenable<StepResult>;
            let registerStepSpy: sinon.SinonSpy;
            beforeEach(() => {
                const handler = new MultiStepHandler();
                registerStepSpy = sinon.spy(handler, 'registerStep');
                resultPromise = testObject.execute(handler, 0, 0);
            });

            afterEach(() => {
                sinon.reset();
            });

            // it('onDidAccept should resolve and return pick.', async () => {
            //     quickPickStub.selectedItems = [{ label: '555555' }];
            //     quickPickStub.activeItems = [{ label: '555555' }];
            //     listener = quickPickStub.onDidAccept.firstCall.args[0];
            //     assert.strictEqual(quickPickStub.onDidAccept.calledOnce, true);

            //     listener(undefined);
            //     assert.strictEqual(quickPick.selectedItems.length, 1);
            //     assert.strictEqual(registerStepSpy.notCalled, true);
            //     assert.strictEqual(quickPickStub.hide.calledOnce, true);
            //     const result = await resultPromise;

            //     assert.strictEqual(result.value, '555555');
            //     assert.strictEqual(result.action, InputFlowAction.Continue);
            // });

            // it('onDidAccept should register step.', async () => {
            //     quickPick.selectedItems = [{ label: 'other-item-label' }];
            //     listener = quickPickStub.onDidAccept.firstCall.args[0];
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
});
