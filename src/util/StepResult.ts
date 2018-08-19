'use strict';

import { InputFlowAction } from './InputFlowAction';

class StepResult {
    constructor(
        private readonly _action: InputFlowAction,
        private readonly _value: string) { }

    public get action(): InputFlowAction {
        return this._action;
    }

    public get value(): string {
        return this._value;
    }
}

export { StepResult };
