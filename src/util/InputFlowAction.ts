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
