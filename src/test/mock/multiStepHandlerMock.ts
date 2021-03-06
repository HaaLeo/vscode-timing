/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as sinon from 'sinon';
import { MultiStepHandler } from '../../step/multiStepHandler';

class MultiStepHandlerMock {

    public run = sinon.stub(MultiStepHandler.prototype, 'run');
    public registerStep = sinon.stub(MultiStepHandler.prototype, 'registerStep');
    public unregisterStep = sinon.stub(MultiStepHandler.prototype, 'unregisterStep');
    public dispose = sinon.stub(MultiStepHandler.prototype, 'dispose');
    public setStepResult = sinon.stub(MultiStepHandler.prototype, 'setStepResult');

    public restore(): void {
        this.run.restore();
        this.registerStep.restore();
        this.unregisterStep.restore();
        this.dispose.restore();
        this.setStepResult.restore();
    }

    public reset(): void {
        this.run.reset();
        this.registerStep.reset();
        this.unregisterStep.reset();
        this.dispose.reset();
        this.setStepResult.reset();
    }
}

export { MultiStepHandlerMock };
