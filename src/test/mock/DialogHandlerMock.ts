'use strict';

import * as sinon from 'sinon';
import { DialogHandler } from '../../dialogHandler';

class DialogHandlerMock implements DialogHandler {
    public showInputDialog = sinon.stub();
    public showOptionsDialog = sinon.stub();
    public showResultDialog = sinon.stub();

    public restore() {
        this.showInputDialog.restore();
        this.showOptionsDialog.restore();
        this.showResultDialog.restore();
    }

    public reset() {
        this.showInputDialog.reset();
        this.showOptionsDialog.reset();
        this.showResultDialog.reset();
    }
}

export { DialogHandlerMock };
