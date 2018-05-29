'use strict';

import * as vscode from 'vscode';
import { convertTime } from './commands/convertTime';
import TimeConverter = require('./timeconverter');
import TimeHoverProvider = require('./timehoverprovider');

export function activate(context: vscode.ExtensionContext) {

    const timeConverter = new TimeConverter();
    const disposable = vscode.commands.registerCommand('timing.convertTime', () => {
        convertTime(timeConverter);
    });

    const hoverDisposable = vscode.languages.registerHoverProvider('*', new TimeHoverProvider(timeConverter));
    context.subscriptions.push(disposable, hoverDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
