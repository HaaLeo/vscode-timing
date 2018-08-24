'use strict';

import * as sinon from 'sinon';
import { IStep } from '../../step/IStep';
import { MultiStepHandler } from '../../step/multiStepHandler';

class MultiStepHandlerMock extends MultiStepHandler {

    public run = sinon.stub();
    public registerStep = sinon.stub();
    public unregisterStep = sinon.stub();
    public dispose = sinon.stub();
    public showResult = sinon.stub();
    protected executeStep = sinon.stub();

    protected _steps: IStep[];
    protected _stepResults: string[];

    public restore() {
        this.run.restore();
        this.registerStep.restore();
        this.unregisterStep.restore();
        this.dispose.restore();
        this.executeStep.restore();
        this.showResult.restore();
    }

    public reset() {
        this.run.reset();
        this.registerStep.reset();
        this.unregisterStep.reset();
        this.executeStep.reset();
        this.dispose.reset();
        this.showResult.reset();
    }
}

export { MultiStepHandlerMock };
