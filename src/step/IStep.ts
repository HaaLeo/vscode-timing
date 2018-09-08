/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { Disposable } from 'vscode';
import { MultiStepHandler } from './multiStepHandler';
import { StepResult } from './stepResult';

/**
 * The Step interface.
 */
interface IStep extends Disposable {

    /**
     * Gets the validation function fo this step.
     */
    validation: (input: string, ...args: string[]) => boolean;

    /**
     * Indicates whether this step is skipped when user selection is valid
     */
    skip: boolean;

    /**
     * Execute this step.
     * @param handler The handler of the step.
     * @param step The step's number.
     * @param totalSteps The amount of overall steps.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     */
    execute(handler: MultiStepHandler, step: number, totalSteps: number, ignoreFocusOut: boolean): Thenable<StepResult>;

    /**
     * Resets the step's current value
     */
    reset(): void;
}

export { IStep };
