'use strict';

import { CustomCommandBase } from './customCommandBase';

import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { QuickPickStep } from '../step/quickPickStep';
import { StepResult } from '../step/stepResult';
import { InputFlowAction } from '../util/InputFlowAction';

class IsoRfcToCustomCommand extends CustomCommandBase {

    private readonly title: string = 'ISO 8601 / RFC 2822 → Custom';

    /**
     * Execute the command.
     */
    public async execute() {
        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let customFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }

            if (loopResult.action === InputFlowAction.Back) {
                [rawInput, customFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput, -1);
            } else {
                [rawInput, customFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, rawInput);
            }

            if (!rawInput || !customFormat) {
                break;
            }

            const result = this._timeConverter.isoRfcToCustom(rawInput, customFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }
            const titlePostfix = inserted ? ': Inserted Result' : ': Result';

            loopResult = await this._resultBox.show(
                'Input: ' + rawInput,
                this.title + titlePostfix,
                result,
                this.insert);
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
    }
}

export { IsoRfcToCustomCommand };
