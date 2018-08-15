'use strict';

import { InputFlowAction } from './InputFlowAction';

class StepResult {
    constructor(
        private readonly _action: InputFlowAction,
        private readonly _value: string,
        private readonly _step: number,
        private readonly _totalSteps: number) {
    }

    public get action(): InputFlowAction {
        return this._action;
    }

    public get value(): string {
        return this._value;
    }

    public get step(): number {
        return this._step;
    }

    public get totalSteps(): number {
        return this._totalSteps;
    }
}

export { StepResult };
