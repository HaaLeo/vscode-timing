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

import { TimeConverter } from './util/timeConverter';
import { TimeHoverProvider } from './util/timeHoverProvider';

export function activate(context: vscode.ExtensionContext) {

    // Create converter
    const timeConverter = new TimeConverter();

    // Create commands
    const customToEpochCommand = new CustomToEpochCommand(context, timeConverter);
    const customToIsoUtcCommand = new CustomToIsoUtcCommand(context, timeConverter);
    const customToIsoLocalCommand = new CustomToIsoLocalCommand(context, timeConverter);
    const epochToCustomCommand = new EpochToCustomCommand(context, timeConverter);
    const epochToIsoLocalCommand = new EpochToIsoLocalCommand(context, timeConverter);
    const epochToIsoUtcCommand = new EpochToIsoUtcCommand(context, timeConverter);
    const nowAsEpochCommand = new NowAsEpochCommand(context, timeConverter);
    const nowAsCustomCommand = new NowAsCustomCommand(context, timeConverter);
    const nowAsIsoLocalCommand = new NowAsIsoLocalCommand(context, timeConverter);
    const nowAsIsoUtcCommand = new NowAsIsoUtcCommand(context, timeConverter);
    const isoRfcToCustomCommand = new IsoRfcToCustomCommand(context, timeConverter);
    const isoRfcToEpochCommand = new IsoRfcToEpochCommand(context, timeConverter);

    const toggleInsertConvertedTimeUserLevelCommand = new ToggleInsertConvertedTimeUserLevelCommand();

    /* tslint:disable:max-line-length */

    context.subscriptions.push(
        // Register Commands
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
