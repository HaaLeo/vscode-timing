/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { TimestampHoverProvider } from '../../util/timestampHoverProvider';
import { TimeConverterMock } from '../mock/timeConverterMock';

describe('TimestampHoverProvider', () => {

    let testEditor: vscode.TextEditor;
    let testObject: TimestampHoverProvider;
    let timeConverterMock: TimeConverterMock;
    let tokenSource: vscode.CancellationTokenSource;

    beforeEach(async () => {
        timeConverterMock = new TimeConverterMock();

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp');
        await config.update('targetFormat', 'utc');
        await config.update('enabled', true);

        timeConverterMock.reset();
        timeConverterMock.isValidEpoch.returns(true);
        testObject = new TimestampHoverProvider(timeConverterMock);
        tokenSource = new vscode.CancellationTokenSource();
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp');
        await config.update('targetFormat', undefined);
        await config.update('enabled', undefined);
    });

    it('should provide correct utc hover message.', async () => {
        timeConverterMock.epochToISOUtc.returns('test-time');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToISOUtc.calledOnce, true);
        assert.equal(timeConverterMock.epochToISOUtc.firstCall.args[0], '123456789000');
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `s`  \n*Timestamp*: `test-time`');
    });

    it('should provide correct local hover message.', async () => {
        timeConverterMock.epochToIsoLocal.returns('test-time');
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp');
        await config.update('targetFormat', 'local');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToIsoLocal.calledOnce, true);
        assert.equal(timeConverterMock.epochToIsoLocal.firstCall.args[0], '123456789000');
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `s`  \n*Timestamp*: `test-time`');
    });

    it('should provide correct custom hover message.', async () => {
        timeConverterMock.epochToCustom.returns('test-time');
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp');
        await config.update('targetFormat', 'YYYY');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToCustom.calledOnce, true);
        assert.equal(timeConverterMock.epochToCustom.firstCall.args[0], '123456789000');
        assert.equal(timeConverterMock.epochToCustom.firstCall.args[1], 'YYYY');
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `s`  \n*Timestamp*: `test-time`');
    });

    it('should return undefined if position is no epoch time.', async () => {
        timeConverterMock.isValidEpoch.callThrough();

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(0, 0),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(timeConverterMock.isValidEpoch.notCalled, true);
    });

    it('should return undefined if it is disabled.', async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp');
        await config.update('enabled', false);

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
    });

    it('should return undefined if config is empty.', async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverTimestamp');
        await config.update('targetFormat', '');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
    });
});
