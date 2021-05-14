/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';

class ConfigHelper implements vscode.Disposable {
    private _disposables: vscode.Disposable[] = [];

    public constructor() {
        this.subscribeToConfig<string | string[]>('timing.hiddenCommands', this.updateContextKeys, this);
    }

    public static get<T>(configKey: string, defaultValue?: T): T {
        return vscode.workspace.getConfiguration().get<T>(configKey, defaultValue);
    }

    public subscribeToConfig<T>(configKey: string, callback: (configValue: T | undefined) => void, thisArg?: unknown): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cb: (configValue: T | undefined) => void = thisArg ? callback.bind(thisArg) : callback;
        const configValue = ConfigHelper.get<T>(configKey);
        cb(configValue);

        vscode.workspace.onDidChangeConfiguration(changedEvent => {
            if (changedEvent.affectsConfiguration(configKey)) {
                const value = ConfigHelper.get<T>(configKey);
                cb(value);
            }
        }, this, this._disposables);
    }

    public dispose(): void {
        this._disposables.forEach(disposable => { disposable.dispose(); });
    }

    private updateContextKeys(rawConfig: string | string[]): void {
        let commandsToHide: string[];

        if (typeof rawConfig === 'string') {
            commandsToHide = rawConfig.split(',').map(value => value.trim());
        } else if (Array.isArray(rawConfig)) {
            commandsToHide = rawConfig;
        } else {
            commandsToHide = [];
        }

        const commands = [
            'timing.customToCustom',
            'timing.customToEpoch',
            'timing.customToIsoLocal',
            'timing.customToIsoUtc',
            'timing.epochToCustom',
            'timing.epochToCustomTimezone',
            'timing.epochToReadableDuration',
            'timing.epochToIsoDuration',
            'timing.epochToIsoLocal',
            'timing.epochToIsoUtc',
            'timing.epochToIsoTimezone',
            'timing.epochToGps',
            'timing.isoDurationToEpoch',
            'timing.isoRfcToCustom',
            'timing.isoRfcToEpoch',
            'timing.nowAsCustom',
            'timing.nowAsEpoch',
            'timing.nowAsIsoLocal',
            'timing.nowAsIsoUtc',
            'timing.toggleInsertConvertedTimeUserLevel'
        ];

        commands.forEach(command => {
            const isEnabled = commandsToHide.includes(command) ? false : true;
            const contextKey = [...command.split('.'), 'enabled'].join(':');
            void vscode.commands.executeCommand('setContext', contextKey, isEnabled);
        });
    }
}

export { ConfigHelper };
