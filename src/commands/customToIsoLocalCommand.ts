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
import { InputFlowAction } from '../util/InputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class CustomToIsoLocalCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → ISO 8601 Local';

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
        this._stepHandler.setStepResult(options.sourceFormat, 0);

        do {
            let rawInput = loopResult.value;

            if (loopResult.action === InputFlowAction.Back) {
                [selectedFormat, rawInput] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [selectedFormat, rawInput] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput || !selectedFormat) {
                break;
            }

            const result = this._timeConverter.customToISOLocal(rawInput, selectedFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }

            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Input: ' + rawInput + ' (Format: ' + selectedFormat + ')',
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

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getCustomFormatStep);
        this._stepHandler.registerStep(getTimeOfCustomFormat);
        this._disposables.push(this._stepHandler);
        this._disposables.push(this._stepHandler);
    }
}

export { CustomToIsoLocalCommand };
