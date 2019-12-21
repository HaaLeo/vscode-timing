/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';

import { CustomCommandBase } from '../../commands/customCommandBase';
import { ConfigHelper } from '../../util/configHelper';
import { TimeConverter } from '../../util/timeConverter';
import { ExtensionContextMock } from '../mock/extensionContextMock';

describe('CustomCommandBase', () => {

    class TestObject extends CustomCommandBase {
        public async execute(): Promise<void> {
        }

        public get customTimeFormatOptions(): vscode.QuickPickItem[] {
            return this._customTimeFormatOptions;
        }
    }

    before(async () => {
        let file: vscode.TextDocument;
        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            file = await vscode.workspace.openTextDocument(uris[0]);
            await vscode.window.showTextDocument(file);
        }
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', undefined);
    });

    it('should should update format options when configuration is updated.', async () => {
        const config = vscode.workspace.getConfiguration('timing');
        const testObject = new TestObject(new ExtensionContextMock(), new TimeConverter(), new ConfigHelper());
        await config.update('customFormats', [{format: 'first'}, {format: 'second'}]);

        const formats = await testObject.customTimeFormatOptions;

        assert.strictEqual(JSON.stringify(formats),
            JSON.stringify([{label: 'first'}, {label: 'second'}]));
    });
});
