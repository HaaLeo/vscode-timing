'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { InputBoxStep } from '../../step/InputBoxStep';

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
                (input: string) => true);
            const result: vscode.InputBox = spy.returnValues[0];

            assert.equal(spy.calledOnce, true);
            assert.equal(result.placeholder, 'test-placeholder');
            assert.equal(result.prompt, 'test-prompt');
            assert.equal(result.title, 'test-title');
            assert.equal(result.validationMessage, '');
            assert.equal(result.ignoreFocusOut, true);

            spy.restore();
        });
    });
});
