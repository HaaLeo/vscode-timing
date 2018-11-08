/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { Disposable, QuickPickItem } from 'vscode';
import { InputFlowAction } from '../util/InputFlowAction';
import { IStep } from './IStep';
import { QuickPickStep } from './quickPickStep';
import { StepResult } from './stepResult';

/**
 * The handles the execution of multiple steps.
 */
class MultiStepHandler implements Disposable {
    /**
     * List of steps to be executed.
     */
    private _steps: IStep[] = [];

    /**
     * The results of each step.
     */
    private _stepResults: string[] = [];

    /**
     * The user's selection in the editor
     */
    private _userSelection: string;

    /**
     * Returns the index of the first occurrence of the `step`.
     */
    public indexOf(step: IStep): Readonly<number> {
        return this._steps.indexOf(step);
    }

    /**
     * Get the results of all steps. Ordered according to the steps.
     */
    public get stepResults(): ReadonlyArray<string> {
        return this._stepResults;
    }

    /**
     * Registers a given step if it was not registered before.
     * @param {IStep} step The step to register
     * @param {number} index zero based index indicating at which position the step is registered.
     */
    public registerStep(step: IStep, index?: number, skipIfUserSelectionValid: boolean = false): void {
        if (this._steps.indexOf(step, 0) === -1) {
            if (index === 0 || index) {
                this._steps.splice(index, 0, step);
            } else {
                this._steps.push(step);
            }
        }
    }

    /**
     * Un-registers the given step if it was registered before.
     * @param step The step to unregister.
     */
    public unregisterStep(step: IStep): void {
        const index = this._steps.indexOf(step, 0);
        if (index !== -1) {
            this._steps.splice(index, 1);
        }
    }

    /**
     * Runs all registered steps.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     * @param userSelection The user's selection before he/she invoked the command.
     * @param startIndex zero based index indicating which step is used for start.
     * If `-1` the last step will be used.
     * @returns A promise to the _ordered_ array containing each step's result
     */
    public async run(
        ignoreFocusOut: boolean,
        userSelection: string,
        startIndex: number = 0,
    ): Promise<string[]> {

        this._userSelection = userSelection;

        if (startIndex === -1) {
            startIndex = this._steps.length - 1;
        } else {
            this._steps.forEach((step) => step.reset());
        }
        await this.executeStep(this._steps[startIndex], ignoreFocusOut);

        // Filter results when sub steps were used
        return this._stepResults.filter(Boolean);
    }

    /**
     * Update the formats of all `QuickPickSteps` that use custom formats.
     * @param formats The new formats to use.
     */
    public updateFormats(formats: QuickPickItem[]): void {
        const quickPickSteps = this._steps.filter((step) => step instanceof QuickPickStep);
        quickPickSteps.forEach((quickPickStep: QuickPickStep) => {
            if (quickPickStep.usesCustomFormats) {
                quickPickStep.items = formats;
            }
        });
    }

    /**
     * Dispose this object.
     */
    public dispose(): void {
        this._steps.forEach((step) => step.dispose());
    }

    /**
     * Executes the given `step` and add result to the `_stepResults`.
     * @param step The step to execute.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     * @returns a promise.
     */
    private async executeStep(step: IStep, ignoreFocusOut: boolean): Promise<void> {
        const stepIndex = this._steps.indexOf(step);
        const totalSteps = this._steps.length;

        let result: StepResult;

        // Check whether this step should be skipped
        if (step.skip
            && step.validation(this._userSelection, this._stepResults[stepIndex - 1])) {
            result = new StepResult(InputFlowAction.Continue, this._userSelection);
        } else {
            result = await step.execute(this, stepIndex + 1, totalSteps, ignoreFocusOut);
        }

        switch (result.action) {

            case InputFlowAction.Continue: {
                this._stepResults[stepIndex] = result.value;
                if (stepIndex < this._steps.length - 1) {
                    await this.executeStep(this._steps[stepIndex + 1], ignoreFocusOut);
                }
                break;
            }
            case InputFlowAction.Back: {
                await this.executeStep(this._steps[stepIndex - 1], ignoreFocusOut);
                break;
            }
            case InputFlowAction.Cancel:
                this._stepResults = [];
                break;
            default:
                throw Error('Unknown input flow action!');
        }
    }
}

export { MultiStepHandler };
