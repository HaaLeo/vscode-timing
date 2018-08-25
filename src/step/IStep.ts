'use strict';

import { Disposable } from 'vscode';
import { MultiStepHandler } from './multiStepHandler';
import { StepResult } from './stepResult';

/**
 * The Step interface.
 */
interface IStep extends Disposable {

    validation: (input: string, ...args: string[]) => boolean;

    /**
     * Execute this step.
     * @param handler The handler of the step.
     * @param step The step's number.
     * @param totalSteps The amount of overall steps.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     */
    execute(handler: MultiStepHandler, step: number, totalSteps: number, ignoreFocusOut: boolean): Thenable<StepResult>;
}

export { IStep };
