'use strict';

import { Disposable } from 'vscode';
import { StepResult } from './StepResult';

interface IStep extends Disposable {
    execute(step: number, totalSteps: number): Promise<StepResult>;
}

export { IStep };
