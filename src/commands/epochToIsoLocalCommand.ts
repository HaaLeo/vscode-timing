/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { InputDefinition } from '../util/inputDefinition';

import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { StepResult } from '../step/stepResult';
import { InputFlowAction } from '../util/InputFlowAction';
import { CommandBase } from './commandBase';

/**
 * Command to convert epoch time to ISO 8601 Local time.
 */
class EpochToIsoLocalCommand extends CommandBase {

    private readonly title: string = 'Epoch → ISO 8601 Local';

    /**
     * Execute the command.
     */
    public async execute() {

        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;

            if (!this._stepHandler) {
                this.initialize();
            }

            if (loopResult.action === InputFlowAction.Back) {
                [rawInput] = await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [rawInput] = await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput) {
                break;
            }

            const input = new InputDefinition(rawInput);
            const result = this._timeConverter.epochToIsoLocal(input.inputAsMs.toString());

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }
            const titlePostfix = inserted ? ': Inserted Result' : ': Result';

            loopResult = await this._resultBox.show(
                'Input: ' + input.originalInput + ' (' + input.originalUnit + ')',
                this.title + titlePostfix,
                result,
                this.insert,
                this._ignoreFocusOut);
        } while (loopResult.action === InputFlowAction.Back
            || (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue));
    }

    /**
     * Initialize all members.
     */
    private initialize(): void {
        const getEpochTimeStep = new InputBoxStep(
            '123456789',
            'Insert the epoch time.',
            this.title,
            'Ensure the epoch time is valid.',
            this._timeConverter.isValidEpoch,
            true);

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getEpochTimeStep);
    }
}

export { EpochToIsoLocalCommand };
