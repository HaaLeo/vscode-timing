/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { QuickPickStep } from '../step/quickPickStep';
import { StepResult } from '../step/stepResult';
import { InputDefinition } from '../util/inputDefinition';
import { InputFlowAction } from '../util/inputFlowAction';

import { Constants } from '../util/constants';
import { CustomCommandBase } from './customCommandBase';

class EpochToCustomTimezoneCommand extends CustomCommandBase {

    private readonly title: string = 'Epoch → Custom Format and Timezone';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}): Promise<void> {
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, await this.getPreInput());
        let timezone: string;

        if (!this._stepHandler) {
            this.initialize();
        }
        this._stepHandler.setStepResult(options.targetFormat, 1);
        this._stepHandler.setStepResult(options.timezone, 2);

        do {
            let rawInput = loopResult.value;

            const internalResult = await this.internalExecute(loopResult.action, 'epochToCustom', rawInput);
            [rawInput, , timezone] = internalResult.stepHandlerResult;

            if (internalResult.showResultBox) {
                const input = new InputDefinition(rawInput);
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

        const alternativeCustomFormatStep = new InputBoxStep(
            'E.g.: YYYY/MM/DD',
            'Insert custom format',
            this.title,
            'Ensure you enter a custom momentjs format.',
            input => input ? true : false,
            false,
            true);
        const getCustomFormatStep = new QuickPickStep(
            'Select custom target format.',
            this.title,
            this._customTimeFormatOptions,
            { label: 'Other Format...' },
            alternativeCustomFormatStep);

        const utcOffsetItems = Constants.UTCOFFSETS.map(offset => ({ label: offset, description: 'UTC Offset' }));
        const timezoneItems = Constants.TIMEZONES.map(timezone => ({ label: timezone, description: 'Timezone' }));
        const getTimezoneStep = new QuickPickStep(
            '+04:00',
            this.title,
            utcOffsetItems.concat(timezoneItems)
        );

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getEpochTimeStep);
        this._stepHandler.registerStep(getCustomFormatStep);
        this._stepHandler.registerStep(getTimezoneStep);
        this._disposables.push(this._stepHandler);
    }
}

export { EpochToCustomTimezoneCommand };
