'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { TimeConverter } from '../../util/timeConverter';
import { TimeHoverProvider } from '../../util/timeHoverProvider';

describe('TimeHoverProvider', () => {

    let testEditor: vscode.TextEditor;
    let testObject: TimeHoverProvider;
    let timeConverter: TimeConverter;
    let tokenSource: vscode.CancellationTokenSource;
    let isValidEpochSpy: sinon.SinonSpy;
    let epochToIsoUtcSpy: sinon.SinonSpy;

    before(async () => {
        timeConverter = new TimeConverter();
        isValidEpochSpy = sinon.spy(timeConverter, 'isValidEpoch');
        epochToIsoUtcSpy = sinon.spy(timeConverter, 'epochToIsoUtc');

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
    });

    beforeEach(() => {
        isValidEpochSpy.resetHistory();
        epochToIsoUtcSpy.resetHistory();
        testObject = new TimeHoverProvider(timeConverter);
        tokenSource = new vscode.CancellationTokenSource();
    });

    after(() => {
        isValidEpochSpy.restore();
        epochToIsoUtcSpy.restore();
    });

    it('should provide correct hover message.', async () => {

        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(3, 32),
            tokenSource.token);

        assert.equal(isValidEpochSpy.calledOnce, true);
        assert.equal(epochToIsoUtcSpy.calledOnce, true);
        assert.equal(epochToIsoUtcSpy.args[0][0], '123456789000');
        assert.equal(result.contents.length, 1);
        assert.equal(
            result.contents[0],
            '*Epoch Unit*: `s`  \n*UTC*: `1973-11-29T21:33:09.000Z`');
    });

    it('should return undefined if position is no epoch time.', async () => {
        const result = await testObject.provideHover(
            testEditor.document,
            new vscode.Position(0, 0),
            tokenSource.token);

        assert.equal(result, undefined);
        assert.equal(isValidEpochSpy.notCalled, true);
        assert.equal(epochToIsoUtcSpy.notCalled, true);
    });
});
