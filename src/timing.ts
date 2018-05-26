'use strict';

import * as vscode from 'vscode';
import DialogHandler = require('./dialoghandler')
import TimeConverter = require('./timeconverter')

export function activate(context: vscode.ExtensionContext) {

    const timeconverter = new TimeConverter()
    const dialoghandler = new DialogHandler(timeconverter)
    let disposable = vscode.commands.registerCommand('timing.convertTime', () => {
        dialoghandler.showInputDialog()
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
