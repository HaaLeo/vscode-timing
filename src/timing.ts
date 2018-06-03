'use strict';

import * as vscode from 'vscode';

import { epochToIsoLocal } from './commands/epochToIsoLocal';
import { epochToIsoUtc } from './commands/epochToIsoUtc';
import { isoRfcToEpoch } from './commands/isoRfcToEpoch';

import TimeConverter = require('./timeConverter');
import TimeHoverProvider = require('./timeHoverProvider');

export function activate(context: vscode.ExtensionContext) {

    const timeConverter = new TimeConverter();
    context.subscriptions.push(
        // Commands
        vscode.commands.registerCommand('timing.convertTime', () => {
            epochToIsoUtc(timeConverter);
        }),
        vscode.commands.registerCommand('timing.epochToIsoUtc', () => {
            epochToIsoUtc(timeConverter);
        }),
        vscode.commands.registerCommand('timing.epochToIsoLocal', () => {
            epochToIsoLocal(timeConverter);
        }),
        vscode.commands.registerCommand('timing.isoRfcToEpoch', () => {
            isoRfcToEpoch(timeConverter);
        }),
        // Hover Provider
        vscode.languages.registerHoverProvider('*', new TimeHoverProvider(timeConverter))
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}
