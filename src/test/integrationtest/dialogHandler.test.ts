'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DialogHandler } from '../../dialogHandler';
import { InputDefinition } from '../../inputDefinition';

describe('DialogHandler', () => {

    let testEditor: vscode.TextEditor;
    let testObject: DialogHandler;

    before(async () => {
        const ext = vscode.extensions.getExtension('HaaLeo.timing');
        if (!ext.isActive) {
            await ext.activate();
        }
    });

    const validateTimeMock = (date: string) => true;
    const convertTimeMock = (time: string, option?: string) => 'testTime';
    beforeEach(async () => {
        testObject = new DialogHandler();
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    describe('showInputDialog', () => {
        it('should show input box with correct placeHolder, prompt.', async () => {
            const spy = sinon.spy(vscode.window, 'showInputBox');

            testObject.showInputDialog('testPlaceHolder', 'testPrompt', (input: string) => true, 'not evaluated');

            assert.equal(spy.calledOnce, true);
            assert.equal(spy.args[0][0].placeHolder, 'testPlaceHolder');
            assert.equal(spy.args[0][0].prompt, 'testPrompt');

            spy.restore();
        });
    });

    describe('showOptionsDialog', () => {
        it('should show options dialog when options are set.', async () => {
            const spy = sinon.spy(vscode.window, 'showQuickPick');
            const testOptions = [{
                description: 'testDescription',
                label: 'testLabel'
            }];
            const testPlaceHolder = 'testPlaceHolder';

            testObject.showOptionsDialog(testOptions, testPlaceHolder);

            assert.equal(spy.calledOnce, true);
            assert.equal(spy.args[0][0], testOptions);
            assert.equal(
                JSON.stringify(spy.args[0][1]),
                JSON.stringify(
                    {
                        canPickMany: false,
                        placeHolder: testPlaceHolder,
                        matchOnDescription: true,
                        matchOnDetail: true
                    }));

            spy.restore();
        });
    });

    describe('showResultDialog', () => {
        it('should call showInputBox with correct args.', () => {
            const spy = sinon.spy(vscode.window, 'showInputBox');
            const testUserInput = new InputDefinition('testInput');

            testObject.showResultDialog('testPlaceHolder', 'testValue', [1, 1], 'testPrompt');

            assert.equal(spy.calledOnce, true);
            assert.equal(
                JSON.stringify(spy.args[0][0]),
                JSON.stringify(
                    {
                        placeHolder: 'testPlaceHolder',
                        value: 'testValue',
                        valueSelection: [1, 1],
                        prompt: 'testPrompt'
                    }));

            spy.restore();
        });
    });
});
