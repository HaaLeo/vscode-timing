/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { MultiStepHandler } from '../step/multiStepHandler';
import { QuickPickStep } from '../step/quickPickStep';
import { StepResult } from '../step/stepResult';
import { ICommandOptions } from '../util/commandOptions';
import { Constants } from '../util/constants';
import { InputFlowAction } from '../util/InputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class NowAsEpochCommand extends CustomCommandBase {

    private readonly title: string = 'Now → Epoch';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, 'not evaluated');
        do {
            let epochTargetFormat: string;

            if (!this._stepHandler) {
                this.initialize();
            }
            this._stepHandler.setStepResult(options.targetUnit, 0);

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

            if (!inserted) {
                loopResult = await this._resultBox.show(
                    'Format: ' + epochTargetFormat,
                    this.title + ': Result',
                    result,
                    this.insert,
                    this._ignoreFocusOut,
                    options.targetUnit ? false : true);
            } else {
                loopResult = new StepResult(InputFlowAction.Cancel, undefined);
            }

        } while (loopResult.action === InputFlowAction.Back
            || (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue));
    }

    private initialize(): void {
        const getEpochTargetFormat = new QuickPickStep(
            'Select epoch target format',
            this.title,
            Constants.EPOCHUNITS,
            undefined,
            undefined,
            undefined,
            false);

        this._stepHandler = new MultiStepHandler();
        this._stepHandler.registerStep(getEpochTargetFormat);
        this._disposables.push(this._stepHandler);
    }
}

export { NowAsEpochCommand };
