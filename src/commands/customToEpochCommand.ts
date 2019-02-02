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
import { InputFlowAction } from '../util/InputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class CustomToEpochCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → Epoch';

    /**
     * Execute the command.
     * @param sourceFormat Pre defined custom source format. If set, it will be used instead of the corresponding step.
     * @param targetUnit Pre defined custom target unit. If set, it will be used instead of the corresponding step.
     */
    public async execute(sourceFormat?: string, targetUnit?: string) {
        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let selectedCustomFormat: string;
            let selectedEpochTargetFormat: string;

            if (!this._stepHandler) {
                this.initialize(sourceFormat, targetUnit);
            }

            if (loopResult.action === InputFlowAction.Back) {
                [selectedCustomFormat, rawInput, selectedEpochTargetFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [selectedCustomFormat, rawInput, selectedEpochTargetFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput || !selectedCustomFormat || !selectedEpochTargetFormat) {
                break;
            }

            const result = this._timeConverter.customToEpoch(rawInput, selectedCustomFormat, selectedEpochTargetFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }

            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput + ' (Format: ' + selectedCustomFormat + ')',
                    this.title + ': Result (' + selectedEpochTargetFormat + ')',
                    result,
                    this.insert,
                    this._ignoreFocusOut);
            } else {
                loopResult = new StepResult(InputFlowAction.Cancel, undefined);
            }

        } while (loopResult.action === InputFlowAction.Back
            || (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue));
    }

    private initialize(sourceFormat: string, targetUnit: string): void {
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
        this._stepHandler.registerStep(getCustomFormatStep, 0, sourceFormat);
        this._stepHandler.registerStep(getTimeOfCustomFormat, 1);
        this._stepHandler.registerStep(getEpochTargetFormat, 2, targetUnit);
    }
}

export { CustomToEpochCommand };
