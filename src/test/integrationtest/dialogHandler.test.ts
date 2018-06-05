'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DialogHandler } from '../../dialogHandler';
import { InputDefinition } from '../../inputDefinition';

suite('DialogHandler', () => {

    let testEditor: vscode.TextEditor;
    let testObject: DialogHandler;

    suiteSetup(async () => {
        const ext = vscode.extensions.getExtension('HaaLeo.timing');
        if (!ext.isActive) {
            await ext.activate();
        }
    });

    const validateTimeMock = (date: string) => true;
    const convertTimeMock = (time: string, option?: string) => 'testTime';
    setup(async () => {
        testObject = new DialogHandler();
        testObject.configure(
            validateTimeMock,
            'testDiagnoseMessage',
            convertTimeMock,
            'testPlaceHolder',
            'testPrompt');

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    suite('showInputDialog', () => {
        test('should show input box with correct placeHolder, prompt.', async () => {
            const spy = sinon.spy(vscode.window, 'showInputBox');

            testObject.showInputDialog();

            assert.equal(spy.calledOnce, true);
            assert.equal(spy.args[0][0].placeHolder, 'testPlaceHolder');
            assert.equal(spy.args[0][0].prompt, 'testPrompt');

            spy.restore();
        });
    });

    suite('showOptionsDialog', () => {
        test('should show options dialog when options are set.', async () => {
            const spy = sinon.spy(vscode.window, 'showQuickPick');
            const testUserInput = new InputDefinition('testInput');
            const testOptions = [{
                description: 'testDescription',
                label: 'testLabel'
            }];
            testObject.configure(
                validateTimeMock,
                'testDiagnoseMessage',
                convertTimeMock,
                'testPlaceHolder',
                'testPrompt',
                testOptions
            );

            testObject.showOptionsDialog(testUserInput);

            assert.equal(spy.calledOnce, true);
            assert.equal(spy.args[0][0], testOptions);
            assert.equal(
                JSON.stringify(spy.args[0][1]),
                JSON.stringify(
                    {
                        canPickMany: false,
                        placeHolder: testOptions[0].label,
                        matchOnDescription: true,
                        matchOnDetail: true
                    }));

            spy.restore();
        });

        test('should directly call result dialog when no options are set.', async () => {
            const spy = sinon.spy(testObject, 'showResultDialog');
            const testUserInput = new InputDefinition('testInput');

            testObject.showOptionsDialog(testUserInput);

            assert.equal(spy.calledOnce, true);
            assert.equal(spy.args[0][0], testUserInput);
            assert.equal(spy.args[0][1], 'testTime');
            assert.equal(spy.args[0][2], undefined);

            spy.restore();
        });
    });

    suite('showResultDialog', () => {
        test('should show unit at result and no unit at input.', async () => {
            const spy = sinon.spy(vscode.window, 'showInputBox');
            const testUserInput = new InputDefinition('testInput');

            testObject.showResultDialog(testUserInput, 'testResult', 'testTargetUnit');

            assert.equal(spy.calledOnce, true);
            assert.equal(
                JSON.stringify(spy.args[0][0]),
                JSON.stringify(
                    {
                        placeHolder: 'testPlaceHolder',
                        value: 'Result: testResult (testTargetUnit)',
                        valueSelection: ['Result: '.length, 'Result: '.length + 'testResult'.toString().length],
                        prompt: 'Input: testInput'
                    }));

            spy.restore();
        });

        test('should show no unit at result and unit at input.', async () => {
            const spy = sinon.spy(vscode.window, 'showInputBox');
            const testUserInput = new InputDefinition('123456789');

            testObject.showResultDialog(testUserInput, 'testResult', undefined);

            assert.equal(spy.calledOnce, true);
            assert.equal(
                JSON.stringify(spy.args[0][0]),
                JSON.stringify(
                    {
                        placeHolder: 'testPlaceHolder',
                        value: 'Result: testResult',
                        valueSelection: ['Result: '.length, 'Result: '.length + 'testResult'.toString().length],
                        prompt: 'Input: 123456789 (' + testUserInput.originalUnit + ')'
                    }));

            spy.restore();
        });

    });
});
