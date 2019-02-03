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
 * Command to convert ISO 8601 /RFC 2822 to epoch time.
 */
class IsoRfcToEpochCommand extends CommandBase {

    private readonly title: string = 'ISO 8601 / RFC 2822 → Epoch';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {

        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let epochTargetFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }
            this._stepHandler.setStepResult(options.targetUnit, 1);

            if (loopResult.action === InputFlowAction.Back) {
                [rawInput, epochTargetFormat] = await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [rawInput, epochTargetFormat] = await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput) {
                break;
            }

            const result = this._timeConverter.isoRfcToEpoch(rawInput, epochTargetFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }

            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput,
                    this.title + ': Result (' + epochTargetFormat + ')',
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
        const getIsoRfcTimeStep = new InputBoxStep(
            '1970-01-01T00:00:00.000Z',
            'Insert a ISO 8601 or RFC 2282 time.',
            this.title,
            'Ensure the time is valid.',
            this._timeConverter.isValidIsoRfc,
            true);

        const getEpochTargetFormat = new QuickPickStep(
            'Select epoch target format',
            this.title,
            Constants.EPOCHUNITS,
            undefined,
            undefined,
            undefined,
            false);

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getIsoRfcTimeStep);
        this._stepHandler.registerStep(getEpochTargetFormat);
    }
}

export { IsoRfcToEpochCommand };
