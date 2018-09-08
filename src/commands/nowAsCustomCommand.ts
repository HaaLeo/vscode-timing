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
import { InputFlowAction } from '../util/InputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class NowAsCustomCommand extends CustomCommandBase {

    private readonly title: string = 'Custom → ISO 8601 Local';

    public async execute() {
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, 'not evaluated');
        do {
            let customFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }

            if (loopResult.action === InputFlowAction.Back) {
                [customFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, 'not evaluated', -1);
            } else {
                [customFormat] =
                    await this._stepHandler.run(this._ignoreFocusOut, 'not evaluated');
            }

            if (!customFormat) {
                break;
            }

            const result = this._timeConverter.getNowAsCustom(customFormat);

            let inserted: boolean = false;
            if (this._insertConvertedTime) {
                inserted = await this.insert(result);
            }
            const titlePostfix = inserted ? ': Inserted Result' : ': Result';

            loopResult = await this._resultBox.show(
                'Format: ' + customFormat,
                this.title + titlePostfix,
                result,
                this.insert,
                this._ignoreFocusOut);
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

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getCustomFormatStep);
    }
}

export { NowAsCustomCommand };
