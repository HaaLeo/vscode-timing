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
import { EpochToCustomCommand } from '../../commands/epochToCustomCommand';
import { EpochToIsoUtcCommand } from '../../commands/epochToIsoUtcCommand';
import { NowAsEpochCommand } from '../../commands/nowAsEpochCommand';
import { ConfigHelper } from '../../util/configHelper';
import { Constants } from '../../util/constants';
import { TimeConverter } from '../../util/timeConverter';
import { ExtensionContextMock } from '../mock/extensionContextMock';

describe('Insert converted time with multiple cursors', () => {
    const timeConverter = new TimeConverter();
    let editor: vscode.TextEditor;
    let showWarningSpy: sinon.SinonSpy;

    const select = (...ranges: [number, number, number, number][]): void => {
        editor.selections = ranges.map(([startLine, startChar, endLine, endChar]) =>
            new vscode.Selection(startLine, startChar, endLine, endChar));
    };

    before(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('insertConvertedTime', true);
        await config.update('clipboard.readingEnabled', false);
        await config.update('clipboard.writingEnabled', false);
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('insertConvertedTime', undefined);
        await config.update('clipboard.readingEnabled', undefined);
        await config.update('clipboard.writingEnabled', false);
    });

    beforeEach(async () => {
        showWarningSpy = sinon.spy(vscode.window, 'showWarningMessage');
        const document = await vscode.workspace.openTextDocument({ content: '1000 abc 2000\n\n' });
        editor = await vscode.window.showTextDocument(document);
    });

    afterEach(async () => {
        showWarningSpy.restore();
        await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
    });

    it('should convert every selection on its own.', async () => {
        select([0, 0, 0, 4], [0, 9, 0, 13]);
        const testObject = new EpochToIsoUtcCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());

        await testObject.execute();

        assert.strictEqual(
            editor.document.getText(),
            `${timeConverter.epochToISOUtc('1000')} abc ${timeConverter.epochToISOUtc('2000')}\n\n`);
        assert.strictEqual(showWarningSpy.notCalled, true);
    });

    it('should use the same options for every selection.', async () => {
        select([0, 0, 0, 4], [0, 9, 0, 13]);
        const testObject = new EpochToCustomCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());

        await testObject.execute({ targetFormat: 'YYYY-MM-DD HH:mm:ss' });

        assert.strictEqual(
            editor.document.getText(),
            `${timeConverter.epochToCustom('1000', 'YYYY-MM-DD HH:mm:ss')} abc ${timeConverter.epochToCustom('2000', 'YYYY-MM-DD HH:mm:ss')}\n\n`);
    });

    it('should leave empty selections untouched and warn the user.', async () => {
        select([0, 0, 0, 4], [1, 0, 1, 0], [0, 9, 0, 13]);
        const testObject = new EpochToIsoUtcCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());

        await testObject.execute();

        assert.strictEqual(
            editor.document.getText(),
            `${timeConverter.epochToISOUtc('1000')} abc ${timeConverter.epochToISOUtc('2000')}\n\n`);
        assert.strictEqual(showWarningSpy.calledOnce, true);
    });

    it('should leave selections with an invalid input untouched and warn the user.', async () => {
        select([0, 0, 0, 4], [0, 5, 0, 8], [0, 9, 0, 13]);
        const testObject = new EpochToIsoUtcCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());

        await testObject.execute();

        assert.strictEqual(
            editor.document.getText(),
            `${timeConverter.epochToISOUtc('1000')} abc ${timeConverter.epochToISOUtc('2000')}\n\n`);
        assert.strictEqual(showWarningSpy.calledOnce, true);
    });

    it('should insert the same result at every cursor for commands without input.', async () => {
        select([1, 0, 1, 0], [2, 0, 2, 0]);
        const testObject = new NowAsEpochCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());

        await testObject.execute({ targetUnit: Constants.SECONDS });

        const [, second, third] = editor.document.getText().split('\n');
        assert.match(second, /^\d+$/);
        assert.strictEqual(second, third);
    });
});
