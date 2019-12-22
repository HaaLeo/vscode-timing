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
import { InputFlowAction } from '../util/inputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class CustomToCustomCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → Custom';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {
        let selectedSourceFormat: string;
        let selectedTargetFormat: string;
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, await this.getPreInput());

        if (!this._stepHandler) {
            this.initialize();
        }
        this._stepHandler.setStepResult(options.sourceFormat, 0);
        this._stepHandler.setStepResult(options.targetFormat, 2);

        do {
            let rawInput = loopResult.value;

            const internalResult = await this.internalExecute(loopResult.action, 'customToCustom', rawInput);

            [selectedSourceFormat, rawInput, selectedTargetFormat] = internalResult.stepHandlerResult;

            if (internalResult.showResultBox) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput + ' (Format: ' + selectedSourceFormat + ')',
                    this.title + ': Result (' + selectedTargetFormat + ')',
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
        this._stepHandler.registerStep(getCustomSourceFormatStep);
        this._stepHandler.registerStep(getTimeOfCustomFormat);
        this._stepHandler.registerStep(getCustomTargetFormatStep);
        this._disposables.push(this._stepHandler);
    }
}

export { CustomToCustomCommand };
