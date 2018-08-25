'use strict';

import { Disposable, ExtensionContext, Uri } from 'vscode';
import { InputFlowAction } from '../util/InputFlowAction';
import { ResultBox } from '../util/resultBox';
import { IStep } from './IStep';
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
    private _stepResults: string[];

    public constructor() {
    }

    /**
     * Registers a given step if it was not registered before.
     * @param {IStep} step The step to register
     * @param {number} index zero based index indicating at which position the step is registered.
     */
    public registerStep(step: IStep, index?: number): void {
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
     * @param startIndex zero based index indicating which step is used for start.
     * If `-1` the last step will be used.
     * @returns A promise to the _ordered_ array containing each step's result
     */
    public async run(ignoreFocusOut: boolean, startIndex: number = 0): Promise<string[]> {
        this._stepResults = [];
        if (startIndex === -1) {
            startIndex = this._steps.length - 1;
        }
        await this.executeStep(this._steps[startIndex], ignoreFocusOut);

        // Filter results when sub steps were used
        return this._stepResults.filter(Boolean);
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
    // protected for easy testing
    protected async executeStep(step: IStep, ignoreFocusOut: boolean): Promise<void> {
        const stepIndex = this._steps.indexOf(step);
        const totalSteps = this._steps.length;

        const result = await step.execute(this, stepIndex + 1, totalSteps, ignoreFocusOut);

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
