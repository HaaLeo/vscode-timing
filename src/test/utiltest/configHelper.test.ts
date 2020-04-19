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

import { ConfigHelper } from '../../util/configHelper';

describe('ConfigHelper', () => {

    let testObject: ConfigHelper;
    const sandbox = sinon.createSandbox();
    let expectedHiddenCommands;
    let executeCommandStub;

    beforeEach(async () => {
        const config = vscode.workspace.getConfiguration('timing.hoverDuration');
        await config.update('sourceUnit', undefined);
        // All 18 commands
        expectedHiddenCommands = {
            'timing:customToCustom:enabled': true,
            'timing:customToEpoch:enabled': true,
            'timing:customToIsoLocal:enabled': true,
            'timing:customToIsoUtc:enabled': true,
            'timing:epochToCustom:enabled': true,
            'timing:epochToReadableDuration:enabled': true,
            'timing:epochToIsoDuration:enabled': true,
            'timing:epochToIsoLocal:enabled': true,
            'timing:epochToIsoUtc:enabled': true,
            'timing:epochToIsoTimezone:enabled': true,
            'timing:isoDurationToEpoch:enabled': true,
            'timing:isoRfcToCustom:enabled': true,
            'timing:isoRfcToEpoch:enabled': true,
            'timing:nowAsCustom:enabled': true,
            'timing:nowAsEpoch:enabled': true,
            'timing:nowAsIsoLocal:enabled': true,
            'timing:nowAsIsoUtc:enabled': true,
            'timing:toggleInsertConvertedTimeUserLevel:enabled': true
        };
        executeCommandStub = sandbox.spy(vscode.commands, 'executeCommand');
        testObject = new ConfigHelper();
    });

    afterEach('Restore', () => {
        sandbox.restore();
    });

    after(async () => {
        const config = vscode.workspace.getConfiguration('timing');
        await config.update('hoverDuration.sourceUnit', undefined);
        await config.update('hiddenCommands', undefined);
    });

    describe('ctor', () => {
        it('Call callback with correct config.', () => {
            const stub = sandbox.stub(ConfigHelper.prototype, 'subscribeToConfig');

            testObject = new ConfigHelper();

            assert.strictEqual(stub.calledOnce, true);
            assert.strictEqual(stub.firstCall.args[0], 'timing.hiddenCommands');
            assert.strictEqual(stub.firstCall.args[2], testObject);
        });

        it('Set context keys', () => {
            const args = executeCommandStub.args.slice(executeCommandStub.args.length - 18);

            assert.strictEqual(args.length, 18);
            Object.entries(expectedHiddenCommands).forEach(([key, isEnabled], index) => {
                assert.strictEqual(args[index][0], 'setContext');
                assert.strictEqual(args[index][1], key);
                assert.strictEqual(args[index][2], isEnabled);
            });
        });

        it('Set context keys according to string setting', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('hiddenCommands', 'timing.customToCustom, timing.customToIsoLocal');
            expectedHiddenCommands['timing:customToCustom:enabled'] = false;
            expectedHiddenCommands['timing:customToIsoLocal:enabled'] = false;

            // Get last 18 calls
            const args = executeCommandStub.args.slice(executeCommandStub.args.length - 18);
            assert.strictEqual(args.length, 18);

            Object.entries(expectedHiddenCommands).forEach(([key, isEnabled], index) => {
                assert.strictEqual(args[index][0], 'setContext');
                assert.strictEqual(args[index][1], key);
                assert.strictEqual(args[index][2], isEnabled);
            });
        });

        it('Set context keys according to array setting', async () => {
            const config = vscode.workspace.getConfiguration('timing');
            await config.update('hiddenCommands', ['timing.customToCustom', 'timing.customToIsoLocal']);
            expectedHiddenCommands['timing:customToCustom:enabled'] = false;
            expectedHiddenCommands['timing:customToIsoLocal:enabled'] = false;

            const args = executeCommandStub.args.slice(executeCommandStub.args.length - 18);
            assert.strictEqual(args.length, 18);

            Object.entries(expectedHiddenCommands).forEach(([key, isEnabled], index) => {
                assert.strictEqual(args[index][0], 'setContext');
                assert.strictEqual(args[index][1], key);
                assert.strictEqual(args[index][2], isEnabled);
            });
        });
    });

    describe('get', () => {
        it('should return the configuration', async () => {
            const config = vscode.workspace.getConfiguration('timing.hoverDuration');
            await config.update('sourceUnit', 's');

            const result = ConfigHelper.get<string>('timing.hoverDuration.sourceUnit');

            assert.strictEqual(result, 's');
        });

        it('should return the default value', () => {
            const result = ConfigHelper.get<string>('timing.hoverDuration.sourceUnit');

            assert.strictEqual(result, 'ms');
        });
    });

    describe('subscribeToConfig', () => {
        it('should call callback once on initialization', () => {
            const callback = sandbox.spy();

            testObject.subscribeToConfig('timing.hoverDuration.sourceUnit', callback);

            assert(callback.calledOnceWith('ms'));
        });

        it('should call callback when config changes.', async () => {
            const callback = sandbox.spy();
            testObject.subscribeToConfig('timing.hoverDuration.sourceUnit', callback);
            const config = vscode.workspace.getConfiguration('timing.hoverDuration');

            await config.update('sourceUnit', 's');

            assert(callback.firstCall.args[0], 'ms');
            assert(callback.secondCall.args[0], 's');
        });
    });
});
