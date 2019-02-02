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
import { InputFlowAction } from '../util/InputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class CustomToCustomCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → Custom';

    /**
     * Execute the command.
     * @param sourceFormat Pre defined custom source format. If set, it will be used instead of the corresponding step.
     * @param targetFormat Pre defined custom target format. If set, it will be used instead of the corresponding step.
     */
    public async execute(sourceFormat?: string, targetFormat?: string) {
        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let selectedSourceFormat: string;
            let selectedTargetFormat: string;

            if (!this._stepHandler) {
                this.initialize(sourceFormat, targetFormat);
            }

            if (loopResult.action === InputFlowAction.Back) {
                [selectedSourceFormat, rawInput, selectedTargetFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [selectedSourceFormat, rawInput, selectedTargetFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput || !selectedSourceFormat || !selectedTargetFormat) {
                break;
            }

            const result = this._timeConverter.customToCustom(rawInput, selectedSourceFormat, selectedTargetFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }

            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput + ' (Format: ' + selectedSourceFormat + ')',
                    this.title + ': Result (' + selectedTargetFormat + ')',
                    result,
                    this.insert,
                    this._ignoreFocusOut);
            } else {
                loopResult = new StepResult(InputFlowAction.Cancel, undefined);
            }

        } while (loopResult.action === InputFlowAction.Back
            || (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue));
    }

    private initialize(sourceFormat: string, targetFormat: string): void {
        const alternativeCustomFormatStep1 = new InputBoxStep(
            'E.g.: YYYY/MM/DD',
            'Insert custom format',
            this.title,
            'Ensure you enter a custom momentjs format.',
            (input) => input ? true : false,
            false,
            true);
        const alternativeCustomFormatStep2 = new InputBoxStep(
            'E.g.: YYYY/MM/DD',
            'Insert custom format',
            this.title,
            'Ensure you enter a custom momentjs format.',
            (input) => input ? true : false,
            false,
            true);

        const getCustomSourceFormatStep = new QuickPickStep(
            'Select custom source format.',
            this.title,
            this._customTimeFormatOptions,
            { label: 'Other Format...' },
            alternativeCustomFormatStep1);
        const getTimeOfCustomFormat = new InputBoxStep(
            '$(prior-result)',
            'Insert time of format: $(prior-result)',
            this.title,
            'Ensure the inserted time has format: $(prior-result)',
            this._timeConverter.isValidCustom,
            true);
        const getCustomTargetFormatStep = new QuickPickStep(
            'Select custom target format.',
            this.title,
            this._customTimeFormatOptions,
            { label: 'Other Format...' },
            alternativeCustomFormatStep2);

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getCustomSourceFormatStep, 0, sourceFormat);
        this._stepHandler.registerStep(getTimeOfCustomFormat, 1);
        this._stepHandler.registerStep(getCustomTargetFormatStep, 2, targetFormat);
    }
}

export { CustomToCustomCommand };
