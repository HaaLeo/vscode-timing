/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { DurationHoverProvider } from '../../hover/durationHoverProvider';
import { ConfigHelper } from '../../util/configHelper';
import { TimeConverterMock } from '../mock/timeConverterMock';

describe('DurationHoverProvider', () => {

    let testEditor: vscode.TextEditor;
    let testObject: DurationHoverProvider;
    let timeConverterMock: TimeConverterMock;

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
        testObject = new DurationHoverProvider(timeConverterMock, new ConfigHelper());
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
            new vscode.Position(3, 32));

        assert.strictEqual(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.firstCall.args[0], '123456789');
        assert.strictEqual(result.contents.length, 1);
        assert.strictEqual(
            result.contents[0],
            '*Epoch Unit*: `ms`  \n*Duration*: `test-duration`');
    });

    it('should provide correct human readable duration hover message (unit: s).', async () => {
        timeConverterMock.epochToReadableDuration.returns('test-duration');
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', 's');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32));

        assert.strictEqual(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.firstCall.args[0], '123456789');
        assert.strictEqual(timeConverterMock.epochToReadableDuration.firstCall.args[1], 's');
        assert.strictEqual(result.contents.length, 1);
        assert.strictEqual(
            result.contents[0],
            '*Epoch Unit*: `s`  \n*Duration*: `test-duration`');
    });

    it('should provide correct human readable duration hover message (unit: ns).', async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', 'ns');
        timeConverterMock.epochToReadableDuration.returns('test-duration');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32));

        assert.strictEqual(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.firstCall.args[0], '123456789');
        assert.strictEqual(timeConverterMock.epochToReadableDuration.firstCall.args[1], 'ns');
        assert.strictEqual(result.contents.length, 1);
        assert.strictEqual(
            result.contents[0],
            '*Epoch Unit*: `ns`  \n*Duration*: `test-duration`');
    });

    it('should provide correct ISO 8601 duration hover message.', async () => {
        timeConverterMock.epochToISODuration.returns('test-duration');
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('useISOTargetFormat', true);

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32));

        assert.strictEqual(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToISODuration.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToISODuration.firstCall.args[0], '123456789');
        assert.strictEqual(result.contents.length, 1);
        assert.strictEqual(
            result.contents[0],
            '*Epoch Unit*: `ms`  \n*Duration*: `test-duration`');
    });

    it('should return undefined if position is no epoch time.', async () => {
        timeConverterMock.isValidEpoch.callThrough();

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(0, 0));

        assert.strictEqual(result, undefined);
        assert.strictEqual(timeConverterMock.isValidEpoch.notCalled, true);
    });

    it('should return undefined if it is disabled.', async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('enabled', false);

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32));

        assert.strictEqual(result, undefined);
        assert.strictEqual(timeConverterMock.isValidEpoch.calledOnce, true);
    });

    it('should return valid duration hover in ms if config is invalid.', async () => {
        timeConverterMock.epochToReadableDuration.returns('test-duration');
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', 'invalid');

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32));

        assert.strictEqual(timeConverterMock.isValidEpoch.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.calledOnce, true);
        assert.strictEqual(timeConverterMock.epochToReadableDuration.firstCall.args[0], '123456789');
        assert.strictEqual(result.contents.length, 1);
        assert.strictEqual(
            result.contents[0],
            '*Epoch Unit*: `ms`  \n*Duration*: `test-duration`');
    });
});
