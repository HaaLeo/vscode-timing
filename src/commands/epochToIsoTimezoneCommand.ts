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
import { QuickPickStep } from '../step/quickPickStep';
import { Constants } from '../util/constants';
import { CommandBase } from './commandBase';

/**
 * Command to convert epoch time to ISO 8601 Utc time.
 */
class EpochToIsoTimezoneCommand extends CommandBase {

    private readonly title: string = 'Epoch → ISO 8601 Custom Timezone';

    /**
     * Execute the command.
     */
    public async execute(options: ICommandOptions = {}): Promise<void> {
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, await this.getPreInput());
        let timezone: string;

        if (!this._stepHandler) {
            this.initialize();
        }
        this._stepHandler.setStepResult(options.timezone, 1);

        do {
            let rawInput = loopResult.value;

            const internalResult = await this.internalExecute(loopResult.action, 'epochToISOTimezone', rawInput);
            [rawInput, timezone] = internalResult.stepHandlerResult;
            const input = new InputDefinition(rawInput);

            if (internalResult.showResultBox) {
                loopResult = await this._resultBox.show(
                    `Input: ${input.originalInput} (${input.originalUnit}), Timezone: ${timezone}`,
                    `${this.title}: Result`,
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

        const utcOffsetItems = Constants.UTCOFFSETS.map(offset => ({ label: offset, description: 'UTC Offset' }));
        const timezoneItems = Constants.TIMEZONES.map(timezone => ({ label: timezone, description: 'Timezone' }));
        const getTimezoneStep = new QuickPickStep(
            '+04:00',
            this.title,
            utcOffsetItems.concat(timezoneItems)
        );

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getEpochTimeStep, 0);
        this._stepHandler.registerStep(getTimezoneStep, 1);
        this._disposables.push(this._stepHandler);
    }
}

export { EpochToIsoTimezoneCommand };
