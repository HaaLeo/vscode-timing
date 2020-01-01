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
import { InputFlowAction } from '../util/inputFlowAction';
import { CommandBase } from './commandBase';

/**
 * Command to convert epoch time to ISO 8601 Local time.
 */
class EpochToIsoLocalCommand extends CommandBase {

    private readonly title: string = 'Epoch → ISO 8601 Local';

    /**
     * Execute the command.
     */
    public async execute(): Promise<void> {
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, await this.getPreInput());
        if (!this._stepHandler) {
            this.initialize();
        }

        do {
            let rawInput = loopResult.value;

            const internalResult = await this.internalExecute(loopResult.action, 'epochToIsoLocal', rawInput);

            [rawInput] = internalResult.stepHandlerResult;
            const input = new InputDefinition(rawInput);

            if (internalResult.showResultBox) {
                loopResult = await this._resultBox.show(
                    'Input: ' + input.originalInput + ' (' + input.originalUnit + ')',
                    this.title + ': Result',
                    internalResult.conversionResult,
                    this.insert,
                    this._ignoreFocusOut);
            } else {
                loopResult = new StepResult(InputFlowAction.Cancel, undefined);
            }

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
        this._stepHandler.registerStep(getEpochTimeStep, 0);
        this._disposables.push(this._stepHandler);
    }
}

export { EpochToIsoLocalCommand };
