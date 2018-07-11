'use strict';

import * as vscode from 'vscode';

import { CustomToEpochCommand } from './commands/customToEpochCommand';
import { CustomToIsoLocalCommand } from './commands/customToIsoLocalCommand';
import { CustomToIsoUtcCommand } from './commands/customToIsoUtcCommand';
import { EpochToCustomCommand } from './commands/epochToCustomCommand';
import { EpochToIsoLocalCommand } from './commands/epochToIsoLocalCommand';
import { EpochToIsoUtcCommand } from './commands/epochToIsoUtcCommand';
import { IsoRfcToCustomCommand } from './commands/isoRfcToCustomCommand';
import { IsoRfcToEpochCommand } from './commands/isoRfcToEpochCommand';
import { NowAsCustomCommand } from './commands/nowAsCustomCommand';
import { NowAsEpochCommand } from './commands/nowAsEpochCommand';
import { NowAsIsoLocalCommand } from './commands/nowAsIsoLocalCommand';
import { NowAsIsoUtcCommand } from './commands/nowAsIsoUtcCommand';
import { ToggleInsertConvertedTimeUserLevelCommand } from './commands/toggleInsertConvertedTimeUserLevelCommand';

import { DialogHandler } from './dialogHandler';
import { TimeConverter } from './timeConverter';
import { TimeHoverProvider } from './timeHoverProvider';

export function activate(context: vscode.ExtensionContext) {

    // Create converter and dialog handler
    const timeConverter = new TimeConverter();
    const dialogHandler = new DialogHandler();

    // Create commands
    const customToEpochCommand = new CustomToEpochCommand(timeConverter, dialogHandler);
    const customToIsoUtcCommand = new CustomToIsoUtcCommand(timeConverter, dialogHandler);
    const customToIsoLocalCommand = new CustomToIsoLocalCommand(timeConverter, dialogHandler);
    const epochToCustomCommand = new EpochToCustomCommand(timeConverter, dialogHandler);
    const epochToIsoLocalCommand = new EpochToIsoLocalCommand(timeConverter, dialogHandler);
    const epochToIsoUtcCommand = new EpochToIsoUtcCommand(timeConverter, dialogHandler);
    const nowAsEpochCommand = new NowAsEpochCommand(timeConverter, dialogHandler);
    const nowAsCustomCommand = new NowAsCustomCommand(timeConverter, dialogHandler);
    const nowAsIsoLocalCommand = new NowAsIsoLocalCommand(timeConverter, dialogHandler);
    const nowAsIsoUtcCommand = new NowAsIsoUtcCommand(timeConverter, dialogHandler);
    const isoRfcToCustomCommand = new IsoRfcToCustomCommand(timeConverter, dialogHandler);
    const isoRfcToEpochCommand = new IsoRfcToEpochCommand(timeConverter, dialogHandler);

    const toggleInsertConvertedTimeUserLevelCommand = new ToggleInsertConvertedTimeUserLevelCommand();

    /* tslint:disable:max-line-length */

    context.subscriptions.push(
        // Register Commands
        vscode.commands.registerCommand('timing.convertTime', epochToIsoUtcCommand.execute, epochToIsoUtcCommand),
        customToEpochCommand, vscode.commands.registerCommand('timing.customToEpoch', customToEpochCommand.execute, customToEpochCommand),
        customToIsoLocalCommand, vscode.commands.registerCommand('timing.customToIsoLocal', customToIsoLocalCommand.execute, customToIsoLocalCommand),
        customToIsoUtcCommand, vscode.commands.registerCommand('timing.customToIsoUtc', customToIsoUtcCommand.execute, customToIsoUtcCommand),
        epochToCustomCommand, vscode.commands.registerCommand('timing.epochToCustom', epochToCustomCommand.execute, epochToCustomCommand),
        epochToIsoLocalCommand, vscode.commands.registerCommand('timing.epochToIsoLocal', epochToIsoLocalCommand.execute, epochToIsoLocalCommand),
        epochToIsoUtcCommand, vscode.commands.registerCommand('timing.epochToIsoUtc', epochToIsoUtcCommand.execute, epochToIsoUtcCommand),
        isoRfcToCustomCommand, vscode.commands.registerCommand('timing.isoRfcToCustom', isoRfcToCustomCommand.execute, isoRfcToCustomCommand),
        isoRfcToEpochCommand, vscode.commands.registerCommand('timing.isoRfcToEpoch', isoRfcToEpochCommand.execute, isoRfcToEpochCommand),
        nowAsCustomCommand, vscode.commands.registerCommand('timing.nowAsCustom', nowAsCustomCommand.execute, nowAsCustomCommand),
        nowAsEpochCommand, vscode.commands.registerCommand('timing.nowAsEpoch', nowAsEpochCommand.execute, nowAsEpochCommand),
        nowAsIsoLocalCommand, vscode.commands.registerCommand('timing.nowAsIsoLocal', nowAsIsoLocalCommand.execute, nowAsIsoLocalCommand),
        nowAsIsoUtcCommand, vscode.commands.registerCommand('timing.nowAsIsoUtc', nowAsIsoUtcCommand.execute, nowAsIsoUtcCommand),

        vscode.commands.registerCommand('timing.toggleInsertConvertedTimeUserLevel', toggleInsertConvertedTimeUserLevelCommand.execute, toggleInsertConvertedTimeUserLevelCommand),
        // Register Hover Provider
        vscode.languages.registerHoverProvider('*', new TimeHoverProvider(timeConverter))
    );
    /* tslint:enable:max-line-length */
}

// this method is called when your extension is deactivated
export function deactivate() {
}
