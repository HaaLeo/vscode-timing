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
import { Constants } from '../util/constants';
import { InputFlowAction } from '../util/inputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class CustomToEpochCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → Epoch';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {
        let selectedCustomFormat: string;
        let selectedEpochTargetFormat: string;
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, await this.getPreInput());

        if (!this._stepHandler) {
            this.initialize();
        }
        this._stepHandler.setStepResult(options.sourceFormat, 0);
        this._stepHandler.setStepResult(options.targetUnit, 2);

        do {
            let rawInput = loopResult.value;

            const internalResult = await this.internalExecute(loopResult.action, 'customToEpoch', rawInput);

            [selectedCustomFormat, rawInput, selectedEpochTargetFormat] = internalResult.stepHandlerResult;
            if (internalResult.showResultBox) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput + ' (Format: ' + selectedCustomFormat + ')',
                    this.title + ': Result (' + selectedEpochTargetFormat + ')',
                    internalResult.conversionResult,
                    this.insert,
                    this._ignoreFocusOut);
            } else {
                loopResult = new StepResult(InputFlowAction.Cancel, undefined);
            }

        } while (loopResult.action === InputFlowAction.Back
            || (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue));
    }

    private initialize(): void {
        const alternativeCustomFormatStep = new InputBoxStep(
            'E.g.: YYYY/MM/DD',
            'Insert custom format',
            this.title,
            'Ensure you enter a custom momentjs format.',
            (input) => input ? true : false,
            false,
            true);

        const getCustomFormatStep = new QuickPickStep(
            'Select custom source format.',
            this.title,
            this._customTimeFormatOptions,
            { label: 'Other Format...' },
            alternativeCustomFormatStep);
        const getTimeOfCustomFormat = new InputBoxStep(
            '$(prior-result)',
            'Insert time of format: $(prior-result)',
            this.title,
            'Ensure the inserted time has format: $(prior-result)',
            this._timeConverter.isValidCustom,
            true);
        const getEpochTargetFormat = new QuickPickStep(
            'Select epoch target format',
            this.title,
            Constants.EPOCHUNITS,
            undefined,
            undefined,
            undefined,
            false); // Does not use custom formats.

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getCustomFormatStep);
        this._stepHandler.registerStep(getTimeOfCustomFormat);
        this._stepHandler.registerStep(getEpochTargetFormat);
        this._disposables.push(this._stepHandler);
    }
}

export { CustomToEpochCommand };
