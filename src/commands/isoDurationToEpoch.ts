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
import { InputFlowAction } from '../util/InputFlowAction';
import { CommandBase } from './commandBase';

/**
 * Command to convert ISO 8601 duration to epoch time.
 */
class IsoDurationToEpochCommand extends CommandBase {

    private readonly title: string = 'ISO 8601 Duration → Epoch';

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
            this._stepHandler.setStepResult(options.targetUnit, 1);

            if (loopResult.action === InputFlowAction.Back) {
                [rawInput, selectedUnit] = await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [rawInput, selectedUnit] = await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput) {
                break;
            }

            const result = this._timeConverter.isoDurationToEpoch(rawInput, selectedUnit);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }

            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput,
                    this.title + ': Result (' + selectedUnit + ')',
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
        const getIsoDuration = new InputBoxStep(
            'P1Y2M3DT4H5M6S',
            'Insert a ISO 8601 duration.',
            this.title,
            'Ensure the duration is valid.',
            this._timeConverter.isValidISODuration,
            true);

        const getEpochTargetUnit = new QuickPickStep(
            'Select epoch target unit',
            this.title,
            Constants.EPOCHUNITS,
            undefined,
            undefined,
            undefined,
            false);

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getIsoDuration);
        this._stepHandler.registerStep(getEpochTargetUnit);
    }
}

export { IsoDurationToEpochCommand };