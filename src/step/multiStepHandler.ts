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
     * List of all possible steps.
     */
    private _stepCache: IStep[] = [];

    /**
     * The results of each step.
     */
    private _stepResults: string[] = [];

    /**
     * The user's selection in the editor
     */
    private _userSelection: string;

    /**
     * Pre defined results. The key is the index of the corresponding step that will be skipped.
     */
    private _givenResults: Map<number, string> = new Map<number, string>();

    /**
     * Returns the index of the first occurrence of the `step`.
     */
    public indexOf(step: IStep): Readonly<number> {
        return this._steps.indexOf(step);
    }

    /**
     * Get the result of a specific step.
     * @param step The index of the step.
     */
    public getPreviousResult(step: IStep): string {
        let stepIndex = 0;
        let result: string;
        for (let i = 0; i < (this._givenResults.size + this._steps.length); i++) {
            if (!this._givenResults.has(i)) {
                if (this._steps[stepIndex] === step) {
                    if (this._givenResults.has(i - 1)) {
                        result = this._givenResults.get(i - 1);
                    } else {
                        result = this._stepResults[stepIndex - 1];
                    }
                    break;
                } else {
                    stepIndex++;
                }
            }
        }

        return result;
    }

    /**
     * Registers a given step if it was not registered before.
     * @param {IStep} step The step to register.
     * @param {number} index zero based index indicating at which position the step is registered.
     * Only use this parameter when registering steps during command execution.
     */
    public registerStep(step: IStep, index?: number): void {

        if (this._steps.indexOf(step, 0) === -1) {
            if (index === 0 || index) {
                this._steps.splice(index, 0, step);
            } else {
                this._steps.push(step);
                this._stepCache.push(step);
            }
        }
    }

    /**
     * Set the `result` of a step indicated by its `index`.
     * @param result The step result.
     * @param index The zero based step index.
     */
    public setStepResult(result: string, index: number): void {
        if (result) {
            this._givenResults.set(index, result);
            if (this.indexOf(this._stepCache[index]) !== -1) {
                // Set index to last element when it is out of range
                if (index > this._steps.length - 1) {
                    index = index - (index - (this._steps.length - 1));
                }
                this._steps.splice(index, 1); // remove step
            }
        } else {
            this._givenResults.delete(index);
            if (this.indexOf(this._stepCache[index]) === -1) {
                this._steps.splice(index, 0, this._stepCache[index]); // add step
            }
        }
    }

    /**
     * Unregister the given step if it was registered before.
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
            this._stepResults = [];
            this._steps.forEach((step) => step.reset());
        }
        await this.executeStep(this._steps[startIndex], ignoreFocusOut);

        // Filter results when sub steps were used
        return this.buildResult();
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
     * @param onBack Indicates whether this step is executed after _back_ was pressed.
     * @returns a promise.
     */
    private async executeStep(step: IStep, ignoreFocusOut: boolean, onBack: boolean = false): Promise<void> {
        const stepIndex = this._steps.indexOf(step);
        const totalSteps = this._steps.length;

        let result: StepResult;

        // Check whether this step should be skipped because of a valid user pre-selection
        if (step.skip
            && step.validation(this._userSelection, this.getPreviousResult(step))
            && !onBack) {
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
                await this.executeStep(this._steps[stepIndex - 1], ignoreFocusOut, true);
                break;
            }
            case InputFlowAction.Cancel:
                this._stepResults = [];
                break;
            default:
                throw Error('Unknown input flow action!');
        }
    }

    /**
     * Build the final result from the `_givenResults` and from the `_stepResults`.
     */
    private buildResult(): string[] {
        this._stepResults = this._stepResults.filter(Boolean);
        let stepIndex = 0;
        const result: string[] = [];

        for (let i = 0; i < (this._givenResults.size + this._stepResults.length); i++) {
            if (this._givenResults.has(i)) {
                result.push(this._givenResults.get(i));
            } else {
                result.push(this._stepResults[stepIndex]);
                stepIndex++;
            }
        }
        return result;
    }
}

export { MultiStepHandler };
