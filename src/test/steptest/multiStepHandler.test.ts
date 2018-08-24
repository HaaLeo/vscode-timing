'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import { IStep } from '../../step/IStep';
import { MultiStepHandler } from '../../step/multiStepHandler';
import { StepResult } from '../../step/stepResult';
import { InputFlowAction } from '../../util/InputFlowAction';

describe('MultiStepHandler', () => {
    let testObject: MultiStepHandler;
    let firstStepStub: sinon.SinonStubbedInstance<IStep>;
    let secondStepStub: sinon.SinonStubbedInstance<IStep>;

    beforeEach(() => {
        testObject = new MultiStepHandler();
        const firstStep: IStep = {
            dispose: () => undefined,
            execute: (handler: MultiStepHandler, step: number, totalSteps: number) => undefined
        };
        firstStepStub = sinon.stub(firstStep);
        firstStepStub.execute.returns(new StepResult(InputFlowAction.Continue, 'first-result'));

        const secondStep: IStep = {
            dispose: () => undefined,
            execute: (handler: MultiStepHandler, step: number, totalSteps: number) => undefined
        };
        secondStepStub = sinon.stub(secondStep);
        secondStepStub.execute.returns(new StepResult(InputFlowAction.Continue, 'second-result'));

    });

    describe('registerStep', () => {
        it('should register steps properly.', async () => {
            testObject.registerStep(firstStepStub);
            testObject.registerStep(secondStepStub);
            const result = await testObject.run();

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'first-result');
            assert.strictEqual(result[1], 'second-result');
        });

        it('should register steps properly by index.', async () => {
            testObject.registerStep(secondStepStub, 0);
            testObject.registerStep(firstStepStub, 0);
            const result = await testObject.run();

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
            const result = await testObject.run();

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0], 'second-result');
        });
    });

    describe('run', () => {
        beforeEach(() => {
            testObject.registerStep(firstStepStub);
            testObject.registerStep(secondStepStub);
        });

        it('should execute all steps an return results', async () => {
            const result = await testObject.run();

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'first-result');
            assert.strictEqual(result[1], 'second-result');
        });

        it('should execute all steps from given index.', async () => {
            const result = await testObject.run(1);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(firstStepStub.execute.notCalled, true);
            assert.strictEqual(result[0], 'second-result');
        });

        it('should execute last step when index = -1.', async () => {
            const result = await testObject.run(-1);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0], 'second-result');
            assert.strictEqual(firstStepStub.execute.notCalled, true);
        });

        it('should go back once.', async () => {
            firstStepStub.execute.onFirstCall().returns(
                new StepResult(InputFlowAction.Continue, 'input user wants to edit'));
            firstStepStub.execute.onSecondCall().returns(
                new StepResult(InputFlowAction.Continue, 'second-result-of-first-step'));
            secondStepStub.execute.onFirstCall().returns(
                new StepResult(InputFlowAction.Back, undefined));
            secondStepStub.execute.onSecondCall().returns(
                new StepResult(InputFlowAction.Continue, 'second-result-of-second-step'));

            const result = await testObject.run();

            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'second-result-of-first-step');
            assert.strictEqual(result[1], 'second-result-of-second-step');
        });

        it('should return empty result when canceled.', async () => {
            firstStepStub.execute.returns(
                new StepResult(InputFlowAction.Cancel, 'input user wants to edit'));
            const result = await testObject.run();

            assert.strictEqual(result.length, 0);
            assert.strictEqual(secondStepStub.execute.notCalled, true);
        });

    });
});
