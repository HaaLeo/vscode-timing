/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import { IStep } from '../../step/IStep';
import { MultiStepHandler } from '../../step/multiStepHandler';
import { StepResult } from '../../step/stepResult';
import { InputFlowAction } from '../../util/inputFlowAction';

describe('MultiStepHandler', () => {
    let testObject: MultiStepHandler;
    let firstStepStub: sinon.SinonStubbedInstance<IStep>;
    let secondStepStub: sinon.SinonStubbedInstance<IStep>;

    beforeEach(() => {
        testObject = new MultiStepHandler();
        const firstStep: IStep = {

            dispose: () => undefined,
            execute: () => undefined,
            validation: () => true,
            get skip(): boolean { return false; },
            reset: () => undefined
        };
        firstStepStub = sinon.stub(firstStep);
        firstStepStub.execute.returns(
            new Promise(resolve => resolve(new StepResult(InputFlowAction.Continue, 'first-result'))));

        const secondStep: IStep = {
            dispose: () => undefined,
            execute: () => undefined,
            validation: () => true,
            get skip(): boolean { return false; },
            reset: () => undefined
        };
        secondStepStub = sinon.stub(secondStep);
        secondStepStub.execute.returns(
            new Promise(resolve => resolve(new StepResult(InputFlowAction.Continue, 'second-result'))));

    });

    describe('registerStep', () => {
        it('should register steps properly.', async () => {
            testObject.registerStep(firstStepStub);
            testObject.registerStep(secondStepStub);
            const result = await testObject.run(true, '');
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'first-result');
            assert.strictEqual(result[1], 'second-result');
        });

        it('should register steps properly by index.', async () => {
            testObject.registerStep(secondStepStub, 1);
            testObject.registerStep(firstStepStub, 0);
            const result = await testObject.run(true, '');

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'first-result');
            assert.strictEqual(result[1], 'second-result');
        });

        it('should not register step when it was registered before.', async () => {
            testObject.registerStep(secondStepStub, 1);
            testObject.registerStep(secondStepStub, 1);
            testObject.registerStep(firstStepStub, 0);
            testObject.registerStep(firstStepStub, 0);
            const result = await testObject.run(true, '');

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'first-result');
            assert.strictEqual(result[1], 'second-result');
        });
    });

    describe('unregisterStep', () => {
        it('should unregister first step.', async () => {
            testObject.registerStep(firstStepStub);
            testObject.registerStep(secondStepStub);
            testObject.unregisterStep(firstStepStub);
            const result = await testObject.run(true, '');

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0], 'second-result');
        });
    });

    describe('run', () => {
        beforeEach(() => {
            testObject.registerStep(firstStepStub);
            testObject.registerStep(secondStepStub);
        });

        it('should execute all steps and return results', async () => {
            const result = await testObject.run(true, '');

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'first-result');
            assert.strictEqual(result[1], 'second-result');
            assert.strictEqual(firstStepStub.reset.calledOnce, true);
            assert.strictEqual(secondStepStub.reset.calledOnce, true);
        });

        it('should execute all steps from given index.', async () => {
            const result = await testObject.run(true, '', 1);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(firstStepStub.execute.notCalled, true);
            assert.strictEqual(result[0], 'second-result');
        });

        it('should execute last step when index = -1.', async () => {
            const result = await testObject.run(true, '', -1);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0], 'second-result');
            assert.strictEqual(firstStepStub.execute.notCalled, true);
            assert.strictEqual(firstStepStub.reset.notCalled, true);
            assert.strictEqual(secondStepStub.reset.notCalled, true);
        });

        it('should skip step if flag is set.', async () => {
            const firstStep: IStep = {
                dispose: () => undefined,
                execute: () => undefined,
                get validation(): () => boolean { return (): boolean => true; },
                get skip(): boolean { return true; },
                reset: () => undefined
            };
            firstStepStub = sinon.stub(firstStep);
            firstStepStub.execute.returns(
                new Promise(resolve => resolve(new StepResult(InputFlowAction.Continue, 'first-result'))));
            testObject = new MultiStepHandler();
            testObject.registerStep(firstStepStub);

            const result = await testObject.run(true, 'test-selection');

            assert.strictEqual(firstStepStub.execute.notCalled, true);
            assert.strictEqual(secondStepStub.execute.notCalled, true);
            assert.strictEqual(result[0], 'test-selection');
        });

        it('should go back once.', async () => {
            firstStepStub.execute.onFirstCall().returns(new Promise(resolve =>
                resolve(new StepResult(InputFlowAction.Continue, 'input user wants to edit'))));
            firstStepStub.execute.onSecondCall().returns(new Promise(resolve =>
                resolve(new StepResult(InputFlowAction.Continue, 'second-result-of-first-step'))));
            secondStepStub.execute.onFirstCall().returns(new Promise(resolve =>
                resolve(new StepResult(InputFlowAction.Back, undefined))));
            secondStepStub.execute.onSecondCall().returns(new Promise(resolve =>
                resolve(new StepResult(InputFlowAction.Continue, 'second-result-of-second-step'))));

            const result = await testObject.run(true, '');

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'second-result-of-first-step');
            assert.strictEqual(result[1], 'second-result-of-second-step');
        });

        it('should throw on unknown input flow action.', async () => {
            firstStepStub.execute.returns(
                new Promise(resolve => resolve(new StepResult(6, 'input user wants to edit'))));

            try {
                await testObject.run(true, '');
                assert.strictEqual(1, 2);
            } catch (e) { }
        });

        it('should return empty result when canceled.', async () => {
            firstStepStub.execute.returns(
                new Promise(resolve => resolve(new StepResult(InputFlowAction.Cancel, 'input user wants to edit'))));
            const result = await testObject.run(true, '');

            assert.strictEqual(result.length, 0);
            assert.strictEqual(secondStepStub.execute.notCalled, true);
        });

    });
    describe('setStepResult', () => {
        let thirdStepStub: sinon.SinonStubbedInstance<IStep>;
        beforeEach(() => {
            testObject = new MultiStepHandler();
            const thirdStep: IStep = {
                dispose: () => undefined,
                execute: () => undefined,
                validation: () => true,
                get skip(): boolean { return false; },
                reset: () => undefined
            };
            thirdStepStub = sinon.stub(thirdStep);
            thirdStepStub.execute.returns(
                new Promise(resolve => resolve(new StepResult(InputFlowAction.Continue, 'third-result'))));

            testObject.registerStep(firstStepStub);
            testObject.registerStep(secondStepStub);
            testObject.registerStep(thirdStepStub);
        });

        it('should return predefined result.', async () => {
            testObject.setStepResult('test-result', 1);

            const result = await testObject.run(true, '');

            assert.strictEqual(firstStepStub.execute.calledOnce, true);
            assert.strictEqual(secondStepStub.execute.notCalled, true);
            assert.strictEqual(thirdStepStub.execute.calledOnce, true);
            assert.strictEqual(result[1], 'test-result');
        });

        it('should return predefined result x-o-o.', async () => {
            testObject.setStepResult('test-result-0', 0);

            const result = await testObject.run(true, '');

            assert.strictEqual(firstStepStub.execute.notCalled, true);
            assert.strictEqual(secondStepStub.execute.calledOnce, true);
            assert.strictEqual(thirdStepStub.execute.calledOnce, true);
            assert.strictEqual(result[0], 'test-result-0');
        });

        it('should return predefined result x-o-x.', async () => {
            testObject.setStepResult('test-result-0', 0);
            testObject.setStepResult('test-result-2', 2);

            const result = await testObject.run(true, '');

            assert.strictEqual(firstStepStub.execute.notCalled, true);
            assert.strictEqual(secondStepStub.execute.calledOnce, true);
            assert.strictEqual(thirdStepStub.execute.notCalled, true);
            assert.strictEqual(result[0], 'test-result-0');
            assert.strictEqual(result[2], 'test-result-2');
        });

        it('should return predefined result o-o-x.', async () => {
            testObject.setStepResult('test-result-2', 2);

            const result = await testObject.run(true, '');

            assert.strictEqual(firstStepStub.execute.calledOnce, true);
            assert.strictEqual(secondStepStub.execute.calledOnce, true);
            assert.strictEqual(thirdStepStub.execute.notCalled, true);
            assert.strictEqual(result[2], 'test-result-2');
        });

        it('should return predefined result o-x.', async () => {
            testObject.unregisterStep(thirdStepStub);
            testObject.setStepResult('test-result-1', 1);

            const result = await testObject.run(true, '');

            assert.strictEqual(firstStepStub.execute.calledOnce, true);
            assert.strictEqual(secondStepStub.execute.notCalled, true);
            assert.strictEqual(thirdStepStub.execute.notCalled, true);
            assert.strictEqual(result[1], 'test-result-1');
        });

        it('should return predefined result x-o.', async () => {
            testObject.unregisterStep(thirdStepStub);
            testObject.setStepResult('test-result-0', 0);

            const result = await testObject.run(true, '');

            assert.strictEqual(firstStepStub.execute.notCalled, true);
            assert.strictEqual(secondStepStub.execute.calledOnce, true);
            assert.strictEqual(thirdStepStub.execute.notCalled, true);
            assert.strictEqual(result[0], 'test-result-0');
        });
    });

    describe('dispose', () => {
        it('should dispose all steps.', () => {
            testObject.registerStep(firstStepStub);
            testObject.registerStep(secondStepStub);

            testObject.dispose();

            assert.strictEqual(firstStepStub.dispose.calledOnce, true);
            assert.strictEqual(secondStepStub.dispose.calledOnce, true);
        });
    });

    describe('replaceInput', () => {
        const createStep = (result: string, skip: boolean = false, validation: (input: string, ...args: string[]) => boolean = () => true): IStep => ({
            dispose: () => undefined,
            execute: () => Promise.resolve(new StepResult(InputFlowAction.Continue, result)),
            validation,
            skip,
            reset: () => undefined
        });

        it('should return undefined when there is no input step.', async () => {
            testObject.registerStep(firstStepStub);
            const result = await testObject.run(true, '');

            assert.strictEqual(testObject.hasInputStep, false);
            assert.strictEqual(testObject.replaceInput(result, 'new-input'), undefined);
        });

        it('should replace the result of the input step.', async () => {
            testObject.registerStep(createStep('format'));
            testObject.registerStep(createStep('input', true, input => Boolean(input) && input !== 'invalid'));
            testObject.registerStep(createStep('target'));
            const result = await testObject.run(true, '');

            assert.strictEqual(testObject.hasInputStep, true);
            assert.deepStrictEqual(testObject.replaceInput(result, 'new-input'), ['format', 'new-input', 'target']);
            assert.deepStrictEqual(result, ['format', 'input', 'target']);
        });

        it('should return undefined when the new input is invalid.', async () => {
            testObject.registerStep(createStep('input', true, input => Boolean(input) && input !== 'invalid'));
            const result = await testObject.run(true, '');

            assert.strictEqual(testObject.replaceInput(result, 'invalid'), undefined);
            assert.strictEqual(testObject.replaceInput(result, ''), undefined);
        });

        it('should respect filtered sub step results and validate with the previous result.', async () => {
            const validation = sinon.spy((input: string, previous: string) => previous === 'custom-format' && input === 'new-input');
            // The first step mimics a quick-pick where "Other Format..." was selected (result is undefined)
            testObject.registerStep(createStep(undefined));
            testObject.registerStep(createStep('custom-format'));
            testObject.registerStep(createStep('input', true, validation));
            const result = await testObject.run(true, '');

            assert.deepStrictEqual(result, ['custom-format', 'input']);
            assert.deepStrictEqual(testObject.replaceInput(result, 'new-input'), ['custom-format', 'new-input']);
            assert.strictEqual(validation.lastCall.args[1], 'custom-format');
        });

        it('should return undefined after the user canceled.', async () => {
            const cancelStep = createStep(undefined, true, () => false);
            cancelStep.execute = () => Promise.resolve(new StepResult(InputFlowAction.Cancel, undefined));
            testObject.registerStep(cancelStep);
            const result = await testObject.run(true, '');

            assert.strictEqual(testObject.hasInputStep, false);
            assert.strictEqual(testObject.replaceInput(result, 'new-input'), undefined);
        });
    });
});
