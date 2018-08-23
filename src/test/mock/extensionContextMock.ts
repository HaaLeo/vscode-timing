'use strict';

import * as sinon from 'sinon';
import { ExtensionContext } from 'vscode';

class ExtensionContextMock implements ExtensionContext {
    public subscriptions = undefined;
    public workspaceState = undefined;
    public globalState = undefined;
    public extensionPath = undefined;
    public asAbsolutePath = sinon.stub().returns('');
    public storagePath = undefined;

    public restore() {
        this.asAbsolutePath.restore();
    }

    public reset() {
        this.asAbsolutePath.reset();
    }
}

export { ExtensionContextMock };
