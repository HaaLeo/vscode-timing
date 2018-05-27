'use strict';

import * as vscode from 'vscode';
import DialogHandler = require('./dialoghandler')
import TimeConverter = require('./timeconverter')
import TimeHoverProvider = require('./timehoverprovider')

export function activate(context: vscode.ExtensionContext) {

    const timeconverter = new TimeConverter()
    const dialoghandler = new DialogHandler(timeconverter)
    let disposable = vscode.commands.registerCommand('timing.convertTime', () => {
        dialoghandler.showInputDialog()
    });

    let hoverProvider = new TimeHoverProvider(timeconverter)
    let hoverDisposable = vscode.languages.registerHoverProvider('*', new TimeHoverProvider(timeconverter));
    context.subscriptions.push(disposable, hoverDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
