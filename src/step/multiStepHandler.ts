/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { Disposable, QuickPickItem } from 'vscode';
import { InputFlowAction } from '../util/inputFlowAction';
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
     * Get the pe-pending result of a specific step.
     * @param step The index of the step.
     */
    public getPreviousResult(step: IStep): string {
        let result: string;
        const previousStepIndex = this.indexOf(step) - 1;
        if (this._givenResults.has(previousStepIndex)) {
            result = this._givenResults.get(previousStepIndex);
        } else if (previousStepIndex >= 0) {
            result = this._stepResults[previousStepIndex];
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
        // Only register step when it is not registered yet
        if (!this._steps.includes(step)) {
            if (index === 0 || index) {
                this._steps.splice(index, 0, step);
                // Shift _givenResultsMap to match index
                for (let i = this._steps.length - 1; i >= index; i--) {
                    if (this._givenResults.has(i)) {
                        this._givenResults.set(i + 1, this._givenResults.get(i));
                        this._givenResults.delete(i);
                    }
                }
            } else {
                this._steps.push(step);
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
        } else {
            this._givenResults.delete(index);
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
            // Shift _givenResultsMap to match index
            for (let i = index; i < this._steps.length; i++) {
                if (this._givenResults.has(i + 1)) {
                    this._givenResults.set(i, this._givenResults.get(i + 1));
                    this._givenResults.delete(i + 1);
                }
            }
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

        let onBack = false;
        if (startIndex === -1) {
            startIndex = this._steps.length - 1;
            onBack = true;
        } else {
            this._stepResults = [];
            this._steps.forEach(step => step.reset());
        }
        await this.executeStep(startIndex, ignoreFocusOut, onBack);

        // Filter results when sub steps were used
        this._stepResults = this._stepResults.filter(Boolean);

        return this._stepResults;
    }

    /**
     * Update the formats of all `QuickPickSteps` that use custom formats.
     * @param formats The new formats to use.
     */
    public updateFormats(formats: QuickPickItem[]): void {
        const quickPickSteps = this._steps.filter(step => step instanceof QuickPickStep);
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
        this._steps.forEach(step => step.dispose());
    }

    /**
     * Executes the given `step` and add result to the `_stepResults`.
     * @param step The step to execute.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     * @param onBack Indicates whether this step is executed after _back_ was pressed.
     * @returns a promise.
     */
    private async executeStep(stepIndex: number, ignoreFocusOut: boolean, onBack: boolean = false): Promise<void> {
        const step = this._steps[stepIndex];

        let result: StepResult;

        // Check whether this step should be skipped because of a valid user pre-selection
        if (step.skip
            && step.validation(this._userSelection, this.getPreviousResult(step))
            && !onBack) {
            result = new StepResult(InputFlowAction.Continue, this._userSelection);
        } else if (this._givenResults.has(stepIndex)) {
            // Check if this step should be skipped because of pre-defined result
            if (onBack) {
                result = new StepResult(InputFlowAction.Back, this._givenResults.get(stepIndex));
            } else {
                result = new StepResult(InputFlowAction.Continue, this._givenResults.get(stepIndex));
            }
        } else {
            let stepIdxToShow = stepIndex + 1;
            for (let i = 0; i <= stepIndex; i++) {
                if (this._givenResults.has(i)) {
                    // Adjust the index when givenResult was used
                    stepIdxToShow--;
                }
            }

            // Execute the step
            result = await step.execute(
                this,
                stepIdxToShow,
                this._steps.length - this._givenResults.size,
                ignoreFocusOut);
        }

        // Evaluate result
        switch (result.action) {

            case InputFlowAction.Continue: {
                this._stepResults[stepIndex] = result.value;
                if (stepIndex < this._steps.length - 1) {
                    await this.executeStep(stepIndex + 1, ignoreFocusOut);
                }
                break;
            }
            case InputFlowAction.Back: {
                await this.executeStep(stepIndex - 1, ignoreFocusOut, true);
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
