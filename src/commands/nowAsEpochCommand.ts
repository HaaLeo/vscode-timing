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
import { Constants } from '../util/constants';
import { InputFlowAction } from '../util/inputFlowAction';
import { ICommandOptions } from './commandOptions';
import { CustomCommandBase } from './customCommandBase';

class NowAsEpochCommand extends CustomCommandBase {

    private readonly title: string = 'Now → Epoch';

    /**
     * Execute the command
     * @param options The command options, to skip option insertion during conversion.
     */
    public async execute(options: ICommandOptions = {}) {
        let epochTargetFormat: string;
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, 'not evaluated');

        if (!this._stepHandler) {
            this.initialize();
        }
        this._stepHandler.setStepResult(options.targetUnit, 0);

        do {
            const internalResult = await this.internalExecute(loopResult.action, 'getNowAsEpoch', undefined);
            [epochTargetFormat] = internalResult.stepHandlerResult;

            if (internalResult.showResultBox) {
                loopResult = await this._resultBox.show(
                    'Format: ' + epochTargetFormat,
                    this.title + ': Result',
                    internalResult.conversionResult,
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
