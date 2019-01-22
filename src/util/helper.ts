/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';

function showDeprecationMessage(msg: string): Thenable<string> {
    return vscode.window.showWarningMessage(msg);
}

export { showDeprecationMessage };
