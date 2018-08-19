'use strict';

import { InputDefinition } from '../inputDefinition';

import { QuickInputButton, QuickInputButtons } from 'vscode';
import { InputBoxStep } from '../util/InputBoxStep';
import { MultiStepHandler } from '../util/MultiStepHandler';
import { QuickPickStep } from '../util/QuickPickStep';
import { CommandBase } from './commandBase';

class EpochToIsoLocalCommand extends CommandBase {
    public async execute() {

        // let userInput = this.isInputSelected();
        const inputStep1 = new InputBoxStep(
            '123456789',
            'Insert epoch time 1.',
            'Epoch to Iso Local Command',
            'Ensure the epoch time is valid.',
            [],
            this._timeConverter.isValidEpoch);
        const alternative = new InputBoxStep(
            '123456789',
            'Insert epoch time alternative.',
            'Epoch to Iso Local Command',
            'Ensure the epoch time is valid.',
            [],
            this._timeConverter.isValidEpoch,
            true);
        const quickPick1 = new QuickPickStep(
            'ms',
            'Epoch to Iso Local Command',
            [],
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
            ],
            { label: 'Something else...' },
            alternative);
        const inputStep2 = new InputBoxStep(
            '123456789',
            'Insert epoch time 2.',
            'Epoch to Iso Local Command',
            'Ensure the epoch time is valid.',
            [],
            this._timeConverter.isValidEpoch,
            false);

        const stepHandler = new MultiStepHandler();
        stepHandler.registerStep(inputStep1);
        stepHandler.registerStep(quickPick1);
        stepHandler.registerStep(inputStep2);

        const result = await stepHandler.run();
        console.log(result);
        //     do {
        //         let input = new InputDefinition(userInput);
        //         if (!input.inputAsMs || !this._timeConverter.isValidEpoch(input.inputAsMs.toString())) {
        //             userInput = await this._dialogHandler.showInputDialog(
        //                 '123456789',
        //                 'Insert epoch time.',
        //                 this._timeConverter.isValidEpoch,
        //                 'Ensure the epoch time is valid.',
        //             );
        //         }
        //         if (userInput !== undefined) {
        //             input = new InputDefinition(userInput);
        //             const result = this._timeConverter.epochToIsoLocal(input.inputAsMs.toString());
        //             let inserted: boolean = false;
        //             if (this._insertConvertedTime) {
        //                 inserted = await this.insert(result);
        //             }
        //             const resultPrefix = inserted ? 'Inserted Result: ' : 'Result: ';

        //             userInput = await this._dialogHandler.showResultDialog(
        //                 '123456789',
        //                 resultPrefix + result,
        //                 [resultPrefix.length, resultPrefix.length + result.length],
        //                 'Input: ' + userInput + ' (' + new InputDefinition(userInput).originalUnit + ')');
        //         }
        //     } while (userInput);
    }
}

export { EpochToIsoLocalCommand };
