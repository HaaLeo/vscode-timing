/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';

import { CommandBase } from '../../commands/commandBase';
import { ConfigHelper } from '../../util/configHelper';
import { InputFlowAction } from '../../util/inputFlowAction';
import { ExtensionContextMock } from '../mock/extensionContextMock';
import { TimeConverterMock } from '../mock/timeConverterMock';

describe('CommandBase', () => {
    class TestObject extends CommandBase {
        public execute(): void { }

        public internalExecuteTest(action: InputFlowAction, conversionName: string, rawInput: string): Thenable<{
            conversionResult: string,
            stepHandlerResult: string[],
            showResultBox: boolean
        }> {
            return this.internalExecute(action, conversionName, rawInput);
        }
        public getPreInputTest(): Thenable<string> {
            return super.getPreInput();
        }

        public insert(arg: string): Thenable<boolean> {
            return super.insert(arg);
        }

        public get insertConvertedTime(): boolean {
            return this._insertConvertedTime;
        }

        public get ignoreFocusOut(): boolean {
            return this._ignoreFocusOut;
        }

        public get hideResultViewOnEnter(): boolean {
            return this._hideResultViewOnEnter;
        }

        public get clipboardReadingEnabled(): boolean {
            return this._readInputFromClipboard;
        }

        public get clipboardWritingEnabled(): boolean {
            return this._writeToClipboard;
        }
    }

    let testEditor: vscode.TextEditor;
    before(async () => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    let timeConverterMock: TimeConverterMock;
    let testObject: TestObject;
    beforeEach(() => {
        timeConverterMock = new TimeConverterMock();
        testObject = new TestObject(new ExtensionContextMock(), timeConverterMock, new ConfigHelper());
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('insertConvertedTime', undefined);
        await config.update('clipboard.readingEnabled', undefined);
        await config.update('clipboard.writingEnabled', false);
        await config.update('ignoreFocusOut', undefined);
        await config.update('hideResultViewOnEnter', undefined);
        await vscode.env.clipboard.writeText('');
    });

    describe('getPreInput', () => {
        it('should get the correct preselected time.', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 32), new vscode.Position(3, 41));

            const result = await testObject.getPreInputTest();

            assert.strictEqual(result, '123456789');
        });

        it('should return selection no matter whether it is a time.', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 4));

            const result = await testObject.getPreInputTest();

            assert.strictEqual(result, 't ');
        });

        it('should return clipboard value when selection is empty.', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 2));
            await vscode.env.clipboard.writeText('test value');
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('clipboard.readingEnabled', true);

            const result = await testObject.getPreInputTest();

            assert.strictEqual(result, 'test value');
        });

        it('should return undefined when selection is empty and clipboard reading is disabled.', async () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 2));
            await vscode.env.clipboard.writeText('test value');
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('clipboard.readingEnabled', false);

            const result = await testObject.getPreInputTest();

            assert.strictEqual(result, undefined);
        });
    });

    describe('config', () => {
        it('should should update insert option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);
            assert.strictEqual(testObject.insertConvertedTime, true);
        });

        it('should should update ignoreFocusOut option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('ignoreFocusOut', true);
            assert.strictEqual(testObject.ignoreFocusOut, true);
        });

        it('should should update hideResultViewOnEnter option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('hideResultViewOnEnter', true);
            assert.strictEqual(testObject.hideResultViewOnEnter, true);
        });

        it('should should update clipboard.readingEnabled option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('clipboard.readingEnabled', false);
            assert.strictEqual(testObject.clipboardReadingEnabled, false);
        });

        it('should should update clipboard.writingEnabled option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('clipboard.writingEnabled', true);
            assert.strictEqual(testObject.clipboardWritingEnabled, true);
        });
    });

    describe('insert', () => {
        beforeEach(async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);

            testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 4));
        });

        it('should insert at the cursor selection', async () => {
            const priorText = await testObject.getPreInputTest();

            let success = await testObject.insert('test arg');
            const insertedText = testEditor.document.getText(testEditor.selection);

            assert.strictEqual(success, true);
            assert.strictEqual(insertedText, 'test arg');

            // Restore
            success = await testEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                editBuilder.replace(testEditor.selection, priorText);
            });
            assert.strictEqual(success, true);
        });
    });

    describe('clipboard', () => {
        it('should write the result to the clipboard when enabled.', async () => {
            timeConverterMock.epochToISOUtc.returns('my test value');
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', false);
            await config.update('clipboard.writingEnabled', true);

            await testObject.internalExecuteTest(
                InputFlowAction.Continue,
                'epochToISOUtc',
                'not evaluated');
            const result = await vscode.env.clipboard.readText();

            assert.strictEqual(result, 'my test value');
        });
    });
});
