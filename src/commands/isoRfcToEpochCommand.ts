'use strict';

import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { QuickPickStep } from '../step/quickPickStep';
import { StepResult } from '../step/stepResult';
import { InputFlowAction } from '../util/InputFlowAction';
import { CommandBase } from './commandBase';

/**
 * Command to convert ISO 8601 /RFC 2822 to epoch time.
 */
class IsoRfcToEpochCommand extends CommandBase {

    private readonly title: string = 'ISO 8601 / RFC 2822 → Epoch';

    /**
     * Execute the command.
     */
    public async execute() {

        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let epochTargetFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }

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
            const titlePostfix = (inserted ? ': Inserted Result' : ': Result') + ' (' + epochTargetFormat + ')';

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

        const getEpochTargetFormat = new QuickPickStep(
            'Select epoch target format',
            this.title,
            [
                {
                    label: 's',
                    detail: 'seconds'
                },
                {
                    label: 'ms',
                    detail: 'milliseconds'
                },
                {
                    label: 'ns',
                    detail: 'nanoseconds'
                }
            ]);
        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getIsoRfcTimeStep);
        this._stepHandler.registerStep(getEpochTargetFormat);
    }
}

export { IsoRfcToEpochCommand };
