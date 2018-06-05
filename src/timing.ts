'use strict';

import * as vscode from 'vscode';

import { EpochToIsoLocalCommand } from './commands/epochToIsoLocalCommand';
import { EpochToIsoUtcCommand } from './commands/epochToIsoUtcCommand';
import { IsoRfcToEpochCommand } from './commands/isoRfcToEpochCommand';
import { NowAsEpochCommand } from './commands/nowAsEpochCommand';
import { NowAsIsoLocalCommand } from './commands/nowAsIsoLocalCommand';
import { NowAsIsoUtcCommand } from './commands/nowAsIsoUtcCommand';

import { DialogHandler } from './dialogHandler';
import { TimeConverter } from './timeConverter';
import { TimeHoverProvider } from './timeHoverProvider';

export function activate(context: vscode.ExtensionContext) {

    // Create converter and dialog handler
    const timeConverter = new TimeConverter();
    const dialogHandler = new DialogHandler();

    // Create commands
    const isoRfcToEpochCommand = new IsoRfcToEpochCommand(timeConverter, dialogHandler);
    const epochToIsoLocalCommand = new EpochToIsoLocalCommand(timeConverter, dialogHandler);
    const epochToIsoUtcCommand = new EpochToIsoUtcCommand(timeConverter, dialogHandler);
    const nowAsEpochCommand = new NowAsEpochCommand(timeConverter, dialogHandler);
    const nowAsIsoLocalCommand = new NowAsIsoLocalCommand(timeConverter, dialogHandler);
    const nowAsIsoUtcCommand = new NowAsIsoUtcCommand(timeConverter, dialogHandler);

    context.subscriptions.push(
        // Register Commands
        vscode.commands.registerCommand(
            'timing.convertTime',
            epochToIsoUtcCommand.execute,
            epochToIsoUtcCommand),
        vscode.commands.registerCommand(
            'timing.epochToIsoUtc',
            epochToIsoUtcCommand.execute,
            epochToIsoUtcCommand),
        vscode.commands.registerCommand(
            'timing.epochToIsoLocal',
            epochToIsoLocalCommand.execute,
            epochToIsoLocalCommand),
        vscode.commands.registerCommand(
            'timing.isoRfcToEpoch',
            isoRfcToEpochCommand.execute,
            isoRfcToEpochCommand),
        vscode.commands.registerCommand(
            'timing.nowAsEpoch',
            nowAsEpochCommand.execute,
            nowAsEpochCommand),
        vscode.commands.registerCommand(
            'timing.nowAsIsoLocal',
            nowAsIsoLocalCommand.execute,
            nowAsIsoLocalCommand),
        vscode.commands.registerCommand(
            'timing.nowAsIsoUtc',
            nowAsIsoUtcCommand.execute,
            nowAsIsoUtcCommand),

        // Register Hover Provider
        vscode.languages.registerHoverProvider('*', new TimeHoverProvider(timeConverter))
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}
