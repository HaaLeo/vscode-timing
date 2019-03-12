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
import { InputFlowAction } from '../util/InputFlowAction';

class IsoRfcToCustomCommand extends CustomCommandBase {

    private readonly title: string = 'ISO 8601 / RFC 2822 → Custom';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {
        let selectedFormat: string;
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, await this.getPreInput());

        if (!this._stepHandler) {
            this.initialize();
        }
        this._stepHandler.setStepResult(options.targetFormat, 1);

        do {
            let rawInput = loopResult.value;

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

            const result = this._timeConverter.isoRfcToCustom(rawInput, selectedFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }
            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput,
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
        const getIsoRfcTimeStep = new InputBoxStep(
            '1970-01-01T00:00:00.000Z',
            'Insert a ISO 8601 or RFC 2282 time.',
            this.title,
            'Ensure the time is valid.',
            this._timeConverter.isValidIsoRfc,
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
        this._stepHandler.registerStep(getIsoRfcTimeStep);
        this._stepHandler.registerStep(getCustomFormatStep);
        this._disposables.push(this._stepHandler);
    }
}

export { IsoRfcToCustomCommand };
