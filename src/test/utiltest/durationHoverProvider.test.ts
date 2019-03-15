/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { DurationHoverProvider } from '../../util/durationHoverProvider';
import { TimeConverterMock } from '../mock/timeConverterMock';

describe('DurationHoverProvider', () => {

    let testEditor: vscode.TextEditor;
    let testObject: DurationHoverProvider;
    let timeConverterMock: TimeConverterMock;
    let tokenSource: vscode.CancellationTokenSource;

    beforeEach(async () => {
        timeConverterMock = new TimeConverterMock();

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', 'ms');
        await config.update('enabled', true);
        await config.update('useISOTargetFormat', false);

        timeConverterMock.reset();
        timeConverterMock.isValidEpoch.returns(true);
        testObject = new DurationHoverProvider(timeConverterMock);
        tokenSource = new vscode.CancellationTokenSource();
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', undefined);
        await config.update('enabled', undefined);
        await config.update('useISOTargetFormat', undefined);
    });

    it('should provide correct human readable duration hover message (unit: ms).', async () => {
        timeConverterMock.epochToReadableDuration.returns('test-duration');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.firstCall.args[0], 123456789);
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `ms`  \n*Duration*: `test-duration`');
    });

    it('should provide correct human readable duration hover message (unit: s).', async () => {
        timeConverterMock.epochToReadableDuration.returns('test-duration');
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', 's');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.firstCall.args[0], 123456789);
        assert.equal(timeConverterMock.epochToReadableDuration.firstCall.args[1], 's');
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `s`  \n*Duration*: `test-duration`');
    });

    it('should provide correct human readable duration hover message (unit: ns).', async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', 'ns');
        timeConverterMock.epochToReadableDuration.returns('test-duration');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.firstCall.args[0], '123456789');
        assert.equal(timeConverterMock.epochToReadableDuration.firstCall.args[1], 'ns');
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `ns`  \n*Duration*: `test-duration`');
    });

    it('should provide correct ISO 8601 duration hover message.', async () => {
        timeConverterMock.epochToISODuration.returns('test-duration');
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('useISOTargetFormat', true);

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToISODuration.calledOnce, true);
        assert.equal(timeConverterMock.epochToISODuration.firstCall.args[0], 123456789);
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `ms`  \n*Duration*: `test-duration`');
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
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('enabled', false);

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
    });

    it('should return valid duration hover in ms if config is invalid.', async () => {
        timeConverterMock.epochToReadableDuration.returns('test-duration');
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', 'invalid');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.equal(timeConverterMock.epochToReadableDuration.firstCall.args[0], 123456789);
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `ms`  \n*Duration*: `test-duration`');
    });
});
