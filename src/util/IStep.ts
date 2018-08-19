'use strict';

import { Disposable } from 'vscode';
import { MultiStepHandler } from './MultiStepHandler';
import { StepResult } from './StepResult';

interface IStep extends Disposable {
    execute(handler: MultiStepHandler, step: number, totalSteps: number): Thenable<StepResult>;
}

export { IStep };
