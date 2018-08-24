'use strict';

import * as vscode from 'vscode';
import { InputDefinition } from '../util/inputDefinition';

import { DialogHandler } from '../dialogHandler';
import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { StepResult } from '../step/stepResult';
import { InputFlowAction } from '../util/InputFlowAction';
import { ResultBox } from '../util/resultBox';
import { TimeConverter } from '../util/timeConverter';
import { CommandBase } from './commandBase';

/**
 * Command to convert epoch time to ISO 8601 local time.
 */
class EpochToIsoLocalCommand extends CommandBase {

    // TODO move to base
    public constructor(
        context: vscode.ExtensionContext, timeConverter: TimeConverter, multiStepHandler: MultiStepHandler) {
        super(context, timeConverter, undefined);
        this._stepHandler = multiStepHandler;
    }

    /**
     * Execute the command.
     */
    public async execute() {

        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            if (!rawInput || !this._timeConverter.isValidEpoch(rawInput)) {
                if (!this._stepHandler.initialized) {
                    this.initialize();
                }

                if (loopResult.action === InputFlowAction.Back) {
                    [rawInput] = await this._stepHandler.run(this._ignoreFocusOut, -1);
                } else {
                    [rawInput] = await this._stepHandler.run(this._ignoreFocusOut);
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
            const resultPostfix = inserted ? 'Inserted Result' : 'Result';

            loopResult = await this._stepHandler.showResult(
                'Input: ' + input.originalInput + ' (' + input.originalUnit + ')',
                'Epoch → Iso 8601 Local: ' + resultPostfix,
                result,
                this.insert);
        } while (loopResult.action !== InputFlowAction.Cancel && !this._hideResultViewOnEnter);
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

        this._stepHandler.registerStep(insertEpochTime);
    }
}

export { EpochToIsoLocalCommand };
