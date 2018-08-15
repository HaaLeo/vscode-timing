'use strict';

import { InputFlowAction } from './InputFlowAction';
import { IStep } from './IStep';

class MultiStepHandler {
    private _steps: IStep[] = [];
    private _results: string[];

    public registerStep(step: IStep): void {
        this._steps.push(step);
    }

    public async run(): Promise<string[]> {
        this._results = [];
        await this.executeStep(this._steps[0], 1, this._steps.length);
        return this._results;
    }

    private async executeStep(step: IStep, displayStepIndex: number, displayTotalSteps: number): Promise<void> {
        const result = await step.execute(displayStepIndex, displayTotalSteps);
        const currentIndex = this._steps.indexOf(step);
        switch (result.action) {

            case InputFlowAction.Continue: {
                this._results[currentIndex] = result.value;
                if (currentIndex < this._steps.length - 1) {
                    await this.executeStep(this._steps[currentIndex + 1], result.step, result.totalSteps);
                }
                break;
            }
            case InputFlowAction.Back: {
                await this.executeStep(this._steps[currentIndex - 1], result.step, result.totalSteps);
                break;
            }
            case InputFlowAction.Cancel:
                this._results = [];
                break;
            default:
                throw Error('Unknown input flow action!');
        }
    }
}

export { MultiStepHandler };
