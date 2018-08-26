'use strict';

import { InputBoxStep } from '../step/inputBoxStep';
import { MultiStepHandler } from '../step/multiStepHandler';
import { QuickPickStep } from '../step/quickPickStep';
import { StepResult } from '../step/stepResult';
import { InputFlowAction } from '../util/InputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class NowAsEpochCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → ISO 8601 Local';

    public async execute() {
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, 'not evaluated');
        do {
            let epochTargetFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }

            if (loopResult.action === InputFlowAction.Back) {
                [epochTargetFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, 'not evaluated', -1);
            } else {
                [epochTargetFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, 'not evaluated');
            }

            if (!epochTargetFormat) {
                break;
            }

            const result = this._timeConverter.getNowAsEpoch(epochTargetFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }
            const titlePostfix = inserted ? ': Inserted Result' : ': Result';

            loopResult = await this._resultBox.show(
                'Format: ' + epochTargetFormat,
                this.title + titlePostfix,
                result,
                this.insert);
        } while (loopResult.action === InputFlowAction.Back
            || (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue));
    }

    private initialize(): void {
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
        this._stepHandler.registerStep(getEpochTargetFormat);
    }
}

export { NowAsEpochCommand };
