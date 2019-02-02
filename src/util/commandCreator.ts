/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';

class CommandCreator implements vscode.Disposable {

    protected _disposables: vscode.Disposable[];

    public constructor(context: vscode.ExtensionContext) {
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.insertConvertedTime')) {
                // this.updateCommands();
            }
        }, this, this._disposables);
    }

    public dispose(): void {
        throw new Error('Method not implemented.');
    }

}

export { CommandCreator };
