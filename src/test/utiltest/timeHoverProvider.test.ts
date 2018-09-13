/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import { stub } from 'sinon';
import * as vscode from 'vscode';
import { TimeHoverProvider } from '../../util/timeHoverProvider';
import { TimeConverterMock } from '../mock/timeConverterMock';

describe('TimeHoverProvider', () => {

    let testEditor: vscode.TextEditor;
    let testObject: TimeHoverProvider;
    let timeConverterMock: TimeConverterMock;
    let tokenSource: vscode.CancellationTokenSource;

    before(async () => {
        timeConverterMock = new TimeConverterMock();

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverTargetFormat', 'utc');
    });

    beforeEach(() => {
        timeConverterMock.reset();
        timeConverterMock.isValidEpoch.returns(true);
        testObject = new TimeHoverProvider(timeConverterMock);
        tokenSource = new vscode.CancellationTokenSource();
    });

    it('should provide correct utc hover message.', async () => {
        timeConverterMock.epochToIsoUtc.returns('test-time');
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverTargetFormat', 'utc');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToIsoUtc.callCount, 1);
        assert.equal(timeConverterMock.epochToIsoUtc.firstCall.args[0], '123456789000');
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `s`  \n*UTC*: `test-time`');
    });

    it('should provide correct local hover message.', async () => {
        timeConverterMock.epochToIsoLocal.returns('test-time');
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverTargetFormat', 'local');

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
            '*Epoch Unit*: `s`  \n*Local*: `test-time`');
    });

    it('should provide correct local hover message.', async () => {
        timeConverterMock.epochToCustom.returns('test-time');
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverTargetFormat', 'YYYY');

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
            '*Epoch Unit*: `s`  \n*Custom*: `test-time`');
    });

    it('should return undefined if position is no epoch time.', async () => {
        timeConverterMock.isValidEpoch.callThrough();
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverTargetFormat', 'utc');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(0, 0),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(timeConverterMock.isValidEpoch.notCalled, true);
    });

    it('should return undefined if "disable" is set in the config.', async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverTargetFormat', 'disable');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
    });

    it('should return undefined if config is empty.', async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverTargetFormat', '');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
    });

});
