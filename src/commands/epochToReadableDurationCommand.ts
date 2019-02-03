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
import { ICommandOptions } from '../util/commandOptions';
import { Constants } from '../util/constants';
import { InputDefinition } from '../util/inputDefinition';
import { InputFlowAction } from '../util/InputFlowAction';
import { CommandBase } from './commandBase';

class EpochToReadableDurationCommand extends CommandBase {

    private readonly title: string = 'Epoch → Readable Duration';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {

        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let selectedUnit: string;

            if (!this._stepHandler) {
                this.initialize();
            }
            this._stepHandler.setStepResult(options.sourceUnit, 1);

            if (loopResult.action === InputFlowAction.Back) {
                [rawInput, selectedUnit] = await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [rawInput, selectedUnit] = await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput) {
                break;
            }

            const input = new InputDefinition(rawInput, selectedUnit);
            const result = this._timeConverter.epochToReadableDuration(input.inputAsMs);

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
        const getEpochSourceFormat = new QuickPickStep(
            'Select epoch source unit',
            this.title,
            Constants.EPOCHUNITS,
            undefined,
            undefined,
            undefined,
            false); // Does not use custom formats.

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getEpochTimeStep);
        this._stepHandler.registerStep(getEpochSourceFormat);
    }
}

export { EpochToReadableDurationCommand };
