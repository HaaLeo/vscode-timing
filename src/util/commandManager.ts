/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';
import { CommandBase } from '../commands/commandBase';
import { CustomToCustomCommand } from '../commands/customToCustomCommand';
import { TimeConverter } from './timeConverter';

class CommandManager implements vscode.Disposable {

    /**
     * Map to keep track of the registered commands.
     */
    private _commandsMap: Map<string, vscode.Disposable> = new Map<string, vscode.Disposable>();

    private _disposables: vscode.Disposable[] = [];

    public constructor(private _context: vscode.ExtensionContext, private _timeConverter: TimeConverter) {
        this.updateCommands();
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration('timing.advancedCommands')) {
                this.updateCommands();
            }
        }, this, this._disposables);
    }

    public dispose(): void {
        throw new Error('Method not implemented.'); // todo dispose commands and disposables
    }

    private updateCommands(): void {
        const config = vscode.workspace.getConfiguration('timing')
            .get<IAdvancedCommand[]>('advancedCommands');

        this.removeOldCommands(config);
        this.addNewCommands(config);
    }

    private removeOldCommands(commands: IAdvancedCommand[]) {

        for (const key of this._commandsMap.keys()) {
            const found = commands.find((command) => {
                if (command.id === key) {
                    return true;
                } else {
                    return false;
                }
            });

            if (!found) {
                this._commandsMap.get(key).dispose();
                this._commandsMap.delete(key);
            }
        }
    }

    private addNewCommands(commands: IAdvancedCommand[]) {
        commands.forEach((command) => {
            if (!this._commandsMap.has(command.id)) {
                const newCommand = this.createCommand(command);
                const disposable =
                    vscode.commands.registerCommand('timing.' + command.id, newCommand.execute, newCommand);

                this._commandsMap.set(command.id, disposable);
            }
        });
    }

    private createCommand(command: IAdvancedCommand): CommandBase {
        let result: CommandBase;

        switch (command.baseCommandId) {
            case 'timing.customToCustom':
                result = new CustomToCustomCommand(this._context, this._timeConverter);
                result.execute = () => {
                    result.execute(command.sourceFormat, command.targetFormat);
                };
                break;
        }
        return result;
    }
}

export { CommandManager };
