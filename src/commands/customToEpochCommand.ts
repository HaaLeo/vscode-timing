'use strict';

import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { QuickPickStep } from '../step/quickPickStep';
import { StepResult } from '../step/stepResult';
import { InputFlowAction } from '../util/InputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class CustomToEpochCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → Epoch';
    public async execute() {
        const preSelection = this.isInputSelected();
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, preSelection);
        do {
            let rawInput = loopResult.value;
            let customFormat: string;
            let epochTargetFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }

            if (loopResult.action === InputFlowAction.Back) {
                [customFormat, rawInput, epochTargetFormat] = await this._stepHandler.run(
                    this._ignoreFocusOut,
                    -1,
                    { userSelection: rawInput, stepToSkip: 1 });
            } else {
                [customFormat, rawInput, epochTargetFormat] = await this._stepHandler.run(
                    this._ignoreFocusOut,
                    0,
                    { userSelection: undefined, stepToSkip: 1 });
            }

            if (!rawInput) {
                break;
            }

            const result = this._timeConverter.customToEpoch(rawInput, customFormat, epochTargetFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }
            const resultPostfix = inserted ? 'Inserted Result' : 'Result';

            loopResult = await this._resultBox.show(
                'Input: ' + rawInput + ' (Format: ' + customFormat + ')',
                this.title + ': ' + resultPostfix,
                result,
                this.insert);
        } while (loopResult.action === InputFlowAction.Back
            || (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue));

        // const targetOptions: QuickPickItem[] = [
        //     {
        //         label: 's',
        //         detail: 'seconds'
        //     },
        //     {
        //         label: 'ms',
        //         detail: 'milliseconds'
        //     },
        //     {
        //         label: 'ns',
        //         detail: 'nanoseconds'
        //     }
        // ];

        // let userInput = this.isInputSelected();

        // do {
        //     const currentFormat = await this.getCustomFormat();
        //     if (!currentFormat) {
        //         break;
        //     }

        //     if (!this._timeConverter.isValidCustom(userInput, currentFormat)) {
        //         userInput = await this._dialogHandler.showInputDialog(
        //             currentFormat,
        //             'Insert time of format: ' + currentFormat,
        //             (input) => this._timeConverter.isValidCustom(input, currentFormat),
        //             'Ensure time and format are valid. (Format: ' + currentFormat + ')'
        //         );
        //     }

        //     if (userInput !== undefined) {
        //         const epochTargetFormat = await this._dialogHandler.showOptionsDialog(
        //             targetOptions,
        //             'Select epoch target format.');
        //         if (!epochTargetFormat) {
        //             break;
        //         }
        //         const result = this._timeConverter.customToEpoch(userInput, currentFormat, epochTargetFormat.label);
        //         let inserted: boolean = false;
        //         if (this._insertConvertedTime) {
        //             inserted = await this.insert(result);
        //         }
        //         const resultPrefix = inserted ? 'Inserted Result: ' : 'Result: ';

        //         userInput = await this._dialogHandler.showResultDialog(
        //             'Press enter to pick new format',
        //             resultPrefix + result + ' (' + new InputDefinition(result).originalUnit + ')',
        //             [resultPrefix.length, resultPrefix.length + result.length],
        //             'Time: ' + userInput);

        //     }
        // } while (userInput !== undefined);
    }

    private initialize(): void {
        const alternativeCustomFormatStep = new InputBoxStep(
            'E.g.: YYYY/MM/DD',
            'Insert custom format',
            this.title,
            'Ensure you enter a custom momentjs format.',
            (input) => input ? true : false,
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
            this._timeConverter.isValidCustom);
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
        this._stepHandler.registerStep(getCustomFormatStep);
        this._stepHandler.registerStep(getTimeOfCustomFormat);
        this._stepHandler.registerStep(getEpochTargetFormat);
    }
}

export { CustomToEpochCommand };
