'use strict';

import { Disposable } from 'vscode';
import { MultiStepHandler } from './MultiStepHandler';
import { StepResult } from './StepResult';

/**
 * The Step interface.
 */
interface IStep extends Disposable {

    /**
     * Execute this step.
     * @param handler The handler of the step.
     * @param step The step's number.
     * @param totalSteps The amount of overall steps.
     */
    execute(handler: MultiStepHandler, step: number, totalSteps: number): Thenable<StepResult>;
}

export { IStep };
