/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { StepResult } from '../step/stepResult';
import { InputFlowAction } from '../util/inputFlowAction';
import { CustomCommandBase } from './customCommandBase';

class NowAsIsoLocalCommand extends CustomCommandBase {

    private readonly title: string = 'Now → ISO 8601 Local';

    public async execute() {
        let loopResult: StepResult = new StepResult(InputFlowAction.Continue, 'not evaluated');

        do {
            const internalResult = await this.internalExecute(loopResult.action, 'getNowAsIsoLocal', undefined);

            if (internalResult.showResultBox) {
                loopResult = await this._resultBox.show(
                    '',
                    this.title + ': Result',
                    internalResult.conversionResult,
                    this.insert,
                    this._ignoreFocusOut,
                    false);
            } else {
                loopResult = new StepResult(InputFlowAction.Cancel, undefined);
            }

        } while (!this._hideResultViewOnEnter && loopResult.action === InputFlowAction.Continue);
    }
}

export { NowAsIsoLocalCommand };
