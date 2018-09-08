/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

/**
 * Indicates what shall be done next.
 */
enum InputFlowAction {
    /**
     * Continue Execution.
     */
    Continue,

    /**
     * Execute previous step.
     */
    Back,

    /**
     * Cancel execution.
     */
    Cancel
}

export { InputFlowAction };
