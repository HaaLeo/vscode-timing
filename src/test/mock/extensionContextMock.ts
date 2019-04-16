/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as sinon from 'sinon';
import { ExtensionContext } from 'vscode';

class ExtensionContextMock implements ExtensionContext {
    public logPath = undefined;
    public subscriptions = undefined;
    public workspaceState = undefined;
    public globalState = undefined;
    public extensionPath = undefined;
    public globalStoragePath = undefined;
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
