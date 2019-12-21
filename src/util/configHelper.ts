/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';

class ConfigHelper implements vscode.Disposable {
    public static async updateContextKeys(changedEvent: vscode.ConfigurationChangeEvent) {
        if (changedEvent.affectsConfiguration('timing.hiddenCommands')) {
            const rawConfig = ConfigHelper.get<string | string[]>('timing.hiddenCommands', []);

            let config: string[];
            if (typeof rawConfig === 'string') {
                config = rawConfig.split(',').map((value) => value.trim());
            } else {
                config = rawConfig;
            }
            const commands = [
                'timing.customToCustom',
                'timing.customToEpoch',
                'timing.customToIsoLocal',
                'timing.customToIsoUtc',
                'timing.epochToCustom',
                'timing.epochToReadableDuration',
                'timing.epochToIsoDuration',
                'timing.epochToIsoLocal',
                'timing.epochToIsoUtc',
                'timing.isoDurationToEpoch',
                'timing.isoRfcToCustom',
                'timing.isoRfcToEpoch',
                'timing.nowAsCustom',
                'timing.nowAsEpoch',
                'timing.nowAsIsoLocal',
                'timing.nowAsIsoUtc',
                'timing.toggleInsertConvertedTimeUserLevel'
            ];

            const results = commands.map((command) => {
                const isEnabled = config.indexOf(command) === -1 ? true : false;
                vscode.commands.executeCommand('setContext', [...command.split('.'), 'enabled'].join(':'), isEnabled);
            });

            return Promise.all(results);
        }
    }

    public static get<T>(configKey: string, defaultValue?: T): T {
        return vscode.workspace.getConfiguration()
            .get<T>(configKey, defaultValue);
    }

    private _disposables: vscode.Disposable[];
    private _section: string;

    constructor(configSection: string) {
        this._section = configSection;
    }

    public subscribeMemberToConfig<T>(configKey: string, memberName: string, thisArg: any, defaultValue?: T) {
        vscode.workspace.onDidChangeConfiguration((changedEvent) => {
            if (changedEvent.affectsConfiguration(this._section)) {
                thisArg[memberName] = ConfigHelper.get(`${this._section}.${configKey}`, defaultValue);
            }
        }, this, this._disposables);
    }

    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }


}

export { ConfigHelper };
