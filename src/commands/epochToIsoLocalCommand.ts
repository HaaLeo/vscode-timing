'use strict';

import { InputDefinition } from '../util/inputDefinition';

import { QuickInputButton, QuickInputButtons } from 'vscode';
import { InputBoxStep } from '../step/InputBoxStep';
import { MultiStepHandler } from '../step/MultiStepHandler';
import { QuickPickStep } from '../step/QuickPickStep';
import { StepResult } from '../step/StepResult';
import { InputFlowAction } from '../util/InputFlowAction';
import { ResultBox } from '../util/ResultBox';
import { CommandBase } from './commandBase';

/**
 * Command to convert epoch time to ISO 8601 local time.
 */
class EpochToIsoLocalCommand extends CommandBase {

    /**
     * Execute the command.
     */
    public async execute() {

        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            if (!rawInput || !this._timeConverter.isValidEpoch(rawInput)) {
                if (!this._stepHandler) {
                    this.initialize();
                }

                if (loopResult.action === InputFlowAction.Back) {
                    [rawInput] = await this._stepHandler.run(-1);
                } else {
                    [rawInput] = await this._stepHandler.run();
                }
            }

            if (!rawInput) {
                break;
            }

            const input = new InputDefinition(rawInput);
            const result = this._timeConverter.epochToIsoLocal(input.inputAsMs.toString());

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }
            const resultPrefix = inserted ? 'Inserted Result: ' : 'Result: ';

            const resultBox = new ResultBox(this._context, this.insert);
            loopResult = await resultBox.show(
                'Input: ' + input.originalInput + ' (' + input.originalUnit + ')',
                'Epoch → Iso 8601 Local: Result',
                result);
        } while (loopResult.action !== InputFlowAction.Cancel);
    }

    /**
     * Initialize all members.
     */
    private initialize(): void {
        const insertEpochTime = new InputBoxStep(
            '123456789',
            'Insert the epoch time.',
            'Epoch → Iso 8601 Local',
            'Ensure the epoch time is valid.',
            this._timeConverter.isValidEpoch);

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(insertEpochTime);
    }
}

export { EpochToIsoLocalCommand };
