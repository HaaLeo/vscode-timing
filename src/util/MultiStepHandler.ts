'use strict';

import { Disposable } from 'vscode';
import { InputFlowAction } from './InputFlowAction';
import { IStep } from './IStep';

class MultiStepHandler implements Disposable {
    private _steps: IStep[] = [];
    private _results: string[];

    public registerStep(step: IStep, index?: number): void {
        if (this._steps.indexOf(step, 0) === -1) {
            if (index) {
                this._steps.splice(index, 0, step);
            } else {
                this._steps.push(step);
            }
        }
    }

    public unregisterStep(step: IStep): void {
        const index = this._steps.indexOf(step, 0);
        if (index !== -1) {
            this._steps.splice(index, 1);
        }
    }

    public async run(): Promise<string[]> {
        this._results = [];
        await this.executeStep(this._steps[0]);
        return this._results.filter(Boolean);
    }

    public dispose(): void {
        this._steps.forEach((step) => step.dispose());
    }

    private async executeStep(step: IStep): Promise<void> {
        const stepIndex = this._steps.indexOf(step);
        const totalSteps = this._steps.length;

        const result = await step.execute(this, stepIndex + 1, totalSteps);

        switch (result.action) {

            case InputFlowAction.Continue: {
                this._results[stepIndex] = result.value;
                if (stepIndex < this._steps.length - 1) {
                    await this.executeStep(this._steps[stepIndex + 1]);
                }
                break;
            }
            case InputFlowAction.Back: {
                await this.executeStep(this._steps[stepIndex - 1]);
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
