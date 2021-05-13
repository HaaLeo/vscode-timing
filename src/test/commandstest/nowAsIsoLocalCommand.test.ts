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
import { NowAsIsoLocalCommand } from '../../commands/nowAsIsoLocalCommand';
import { StepResult } from '../../step/stepResult';
import { ConfigHelper } from '../../util/configHelper';
import { InputFlowAction } from '../../util/inputFlowAction';
import { ResultBox } from '../../util/resultBox';
import { TimeConverter } from '../../util/timeConverter';
import { ExtensionContextMock } from '../mock/extensionContextMock';

describe('NowAsIsoLocalCommand', () => {
    let timeConverter: TimeConverter;
    let testObject: NowAsIsoLocalCommand;
    let testEditor: vscode.TextEditor;
    let showResultStub: sinon.SinonStub;

    before(async () => {
        timeConverter = new TimeConverter();
        showResultStub = sinon.stub(ResultBox.prototype, 'show');

        if (vscode.workspace.workspaceFolders !== undefined) {
            const uris = await vscode.workspace.findFiles('*.ts');
            const file = await vscode.workspace.openTextDocument(uris[0]);
            testEditor = await vscode.window.showTextDocument(file);
        }
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', []);
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('customFormats', undefined);
        await config.update('insertConvertedTime', undefined);
        await config.update('ignoreFocusOut', undefined);
        await config.update('hideResultViewOnEnter', undefined);
        showResultStub.restore();
    });

    describe('execute', () => {

        beforeEach('Reset', () => {
            testObject = new NowAsIsoLocalCommand(new ExtensionContextMock(), timeConverter, new ConfigHelper());
            testEditor.selection = new vscode.Selection(new vscode.Position(3, 32), new vscode.Position(3, 41));
            showResultStub.returns(new StepResult(InputFlowAction.Cancel, undefined));
        });

        afterEach(() => {
            showResultStub.resetHistory();
        });

        it('Should show result after calculation', async () => {
            await testObject.execute();

            assert.strictEqual(showResultStub.calledOnce, true);
        });
    });
});
