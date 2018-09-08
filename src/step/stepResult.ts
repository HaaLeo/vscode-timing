/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { InputFlowAction } from '../util/InputFlowAction';

/**
 * The result of a step.
 */
class StepResult {

    /**
     * Creates a `StepResult`
     * @param _action The next action.
     * @param _value The result value.
     */
    constructor(
        private readonly _action: InputFlowAction,
        private readonly _value: string) { }

    /**
     * Gets the action.
     */
    public get action(): InputFlowAction {
        return this._action;
    }

    /**
     * Gets the value.
     */
    public get value(): string {
        return this._value;
    }
}

export { StepResult };
