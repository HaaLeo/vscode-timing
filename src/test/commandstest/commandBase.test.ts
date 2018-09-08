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
import { TimeConverter } from '../../util/timeConverter';
import { ExtensionContextMock } from '../mock/extensionContextMock';

describe('CommandBase', () => {

    class TestObject extends CommandBase {
        public execute(): string {
            return this.isInputSelected();
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

    }

    let testEditor: vscode.TextEditor;
    before(async () => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('insertConvertedTime', undefined);
    });

    describe('isInputSelected', () => {
        it('should get the correct preselected time.', () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 32), new vscode.Position(3, 41));
            const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter());

            const result = testObject.execute();

            assert.equal(result, '123456789');
        });

        it('should return selection no matter whether it is a time.', () => {
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 4));
            const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter());

            const result = testObject.execute();

            assert.equal(result, 't ');
        });
    });

    describe('config', () => {
        it('should should update insert option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter());

            await config.update('insertConvertedTime', true);

            assert.equal(testObject.insertConvertedTime, true);
        });

        it('should should update ignoreFocusOut option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter());

            await config.update('ignoreFocusOut', true);

            assert.equal(testObject.ignoreFocusOut, true);
        });

        it('should should update hideResultViewOnEnter option when configuration is updated.', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter());

            await config.update('hideResultViewOnEnter', true);

            assert.equal(testObject.hideResultViewOnEnter, true);
        });
    });

    describe('insert', () => {
        let testObject: TestObject;

        beforeEach(async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('insertConvertedTime', true);

            testObject = new TestObject(new ExtensionContextMock(), new TimeConverter());
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 2), new vscode.Position(3, 4));
        });

        it('should insert at the cursor selection', async () => {
            const priorText = testObject.execute();

            let success = await testObject.insert('test arg');
            const insertedText = testEditor.document.getText(testEditor.selection);

            assert.equal(success, true);
            assert.equal(insertedText, 'test arg');

            // Restore
            success = await testEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                editBuilder.replace(testEditor.selection, priorText);
            });
            assert.equal(success, true);
        });
    });
});
