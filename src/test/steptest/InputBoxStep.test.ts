'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { InputBoxStep } from '../../step/InputBoxStep';
import { MultiStepHandler } from '../../step/MultiStepHandler';

describe('InputBoxStep', () => {
    let testObject: InputBoxStep;
    let testEditor: vscode.TextEditor;

    beforeEach(async () => {
        testObject = new InputBoxStep(
            'test-placeholder',
            'test prompt',
            'test-title',
            'test-validation-message',
            (input: string) => true);
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    describe('ctor', () => {
        it('should create an InputBox', () => {
            const spy = sinon.spy(vscode.window, 'createInputBox');

            testObject = new InputBoxStep(
                'test-placeholder',
                'test-prompt',
                'test-title',
                'test-validation-message',
                () => true);
            const result: vscode.InputBox = spy.returnValues[0];

            assert.strictEqual(spy.calledOnce, true);
            assert.strictEqual(result.placeholder, 'test-placeholder');
            assert.strictEqual(result.prompt, 'test-prompt');
            assert.strictEqual(result.title, 'test-title');
            assert.strictEqual(result.validationMessage, '');
            assert.strictEqual(result.ignoreFocusOut, true);

            spy.restore();
        });
    });

    describe('execute', () => {
        let spy: sinon.SinonSpy;
        let inputBoxStub: sinon.SinonStubbedInstance<vscode.InputBox>;

        beforeEach(() => {
            spy = sinon.spy(vscode.window, 'createInputBox');
            testObject = new InputBoxStep(
                'test-placeholder',
                'test-prompt',
                'test-title',
                'test-validation-message',
                () => true);
            assert.equal(spy.calledOnce, true);

            const inputBox: vscode.InputBox = spy.returnValues[0];
            inputBoxStub = sinon.stub(inputBox);
        });

        afterEach(() => {
            spy.restore();
            sinon.reset();
        });

        it('should add back button when step greater 1', () => {
            testObject.execute(new MultiStepHandler(), 2, 2);

            assert.strictEqual(inputBoxStub.buttons.length, 1);
            assert.strictEqual(inputBoxStub.buttons[0], vscode.QuickInputButtons.Back);
        });

        it('should not add back button when step is 1', () => {
            testObject.execute(new MultiStepHandler(), 1, 2);

            assert.strictEqual(inputBoxStub.buttons.length, 0);
        });

        it('should register event listener and show the input box.', () => {
            testObject.execute(new MultiStepHandler(), 0, 0);

            assert.strictEqual(inputBoxStub.onDidAccept.calledOnce, true);
            assert.strictEqual(inputBoxStub.onDidChangeValue.calledOnce, true);
            assert.strictEqual(inputBoxStub.onDidHide.calledOnce, true);
            assert.strictEqual(inputBoxStub.onDidTriggerButton.calledOnce, true);
            assert.strictEqual(inputBoxStub.show.calledOnce, true);
        });

        it('should set input box step member.', () => {
            testObject.execute(new MultiStepHandler(), 4, 10);

            assert.strictEqual(inputBoxStub.step, 4);
            assert.strictEqual(inputBoxStub.totalSteps, 10);
        });

    });
});
