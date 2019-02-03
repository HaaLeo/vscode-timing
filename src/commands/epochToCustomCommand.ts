/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { CustomCommandBase } from './customCommandBase';

import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { QuickPickStep } from '../step/quickPickStep';
import { StepResult } from '../step/stepResult';
import { ICommandOptions } from '../util/commandOptions';
import { InputDefinition } from '../util/inputDefinition';
import { InputFlowAction } from '../util/InputFlowAction';

class EpochToCustomCommand extends CustomCommandBase {

    private readonly title: string = 'Epoch → Custom';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {
        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let selectedFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }
            this._stepHandler.setStepResult(options.targetFormat, 1);

            if (loopResult.action === InputFlowAction.Back) {
                [rawInput, selectedFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [rawInput, selectedFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput || !selectedFormat) {
                break;
            }

            const input = new InputDefinition(rawInput);
            const result = this._timeConverter.epochToCustom(input.inputAsMs.toString(), selectedFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }

            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Input: ' + input.originalInput + ' (' + input.originalUnit + ')',
                    this.title + ': Result',
                    result,
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
            (input) => input ? true : false,
            false,
            true);
        const getCustomFormatStep = new QuickPickStep(
            'Select custom source format.',
            this.title,
            this._customTimeFormatOptions,
            { label: 'Other Format...' },
            alternativeCustomFormatStep);

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getEpochTimeStep);
        this._stepHandler.registerStep(getCustomFormatStep);
        this._disposables.push(this._stepHandler);
    }
}

export { EpochToCustomCommand };
