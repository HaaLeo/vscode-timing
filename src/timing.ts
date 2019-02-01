/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as vscode from 'vscode';

import { CustomToCustomCommand } from './commands/customToCustomCommand';
import { CustomToEpochCommand } from './commands/customToEpochCommand';
import { CustomToIsoLocalCommand } from './commands/customToIsoLocalCommand';
import { CustomToIsoUtcCommand } from './commands/customToIsoUtcCommand';
import { EpochToCustomCommand } from './commands/epochToCustomCommand';
import { EpochToISODurationCommand } from './commands/epochToISODurationCommand';
import { EpochToIsoLocalCommand } from './commands/epochToIsoLocalCommand';
import { EpochToIsoUtcCommand } from './commands/epochToIsoUtcCommand';
import { EpochToReadableDurationCommand } from './commands/epochToReadableDurationCommand';
import { IsoDurationToEpochCommand } from './commands/isoDurationToEpoch';
import { IsoRfcToCustomCommand } from './commands/isoRfcToCustomCommand';
import { IsoRfcToEpochCommand } from './commands/isoRfcToEpochCommand';
import { NowAsCustomCommand } from './commands/nowAsCustomCommand';
import { NowAsEpochCommand } from './commands/nowAsEpochCommand';
import { NowAsIsoLocalCommand } from './commands/nowAsIsoLocalCommand';
import { NowAsIsoUtcCommand } from './commands/nowAsIsoUtcCommand';
import { ToggleInsertConvertedTimeUserLevelCommand } from './commands/toggleInsertConvertedTimeUserLevelCommand';

import { DurationHoverProvider } from './util/durationHoverProvider';
import { TimeConverter } from './util/timeConverter';
import { TimestampHoverProvider } from './util/timestampHoverProvider';

export function activate(context: vscode.ExtensionContext) {

    // Create converter
    const timeConverter = new TimeConverter();

    // Create commands
    const customToCustomCommand = new CustomToCustomCommand(context, timeConverter);
    const customToEpochCommand = new CustomToEpochCommand(context, timeConverter);
    const customToIsoUtcCommand = new CustomToIsoUtcCommand(context, timeConverter);
    const customToIsoLocalCommand = new CustomToIsoLocalCommand(context, timeConverter);
    const epochToCustomCommand = new EpochToCustomCommand(context, timeConverter);
    const epochToReadableDurationCommand = new EpochToReadableDurationCommand(context, timeConverter);
    const epochToIsoDurationCommand = new EpochToISODurationCommand(context, timeConverter);
    const epochToIsoLocalCommand = new EpochToIsoLocalCommand(context, timeConverter);
    const epochToIsoUtcCommand = new EpochToIsoUtcCommand(context, timeConverter);
    const nowAsEpochCommand = new NowAsEpochCommand(context, timeConverter);
    const nowAsCustomCommand = new NowAsCustomCommand(context, timeConverter);
    const nowAsIsoLocalCommand = new NowAsIsoLocalCommand(context, timeConverter);
    const nowAsIsoUtcCommand = new NowAsIsoUtcCommand(context, timeConverter);
    const isoDurationToEpochCommand = new IsoDurationToEpochCommand(context, timeConverter);
    const isoRfcToCustomCommand = new IsoRfcToCustomCommand(context, timeConverter);
    const isoRfcToEpochCommand = new IsoRfcToEpochCommand(context, timeConverter);

    const toggleInsertConvertedTimeUserLevelCommand = new ToggleInsertConvertedTimeUserLevelCommand();

    const timestampHoverProvider = new TimestampHoverProvider(timeConverter);
    const durationHoverProvider = new DurationHoverProvider(timeConverter);
    /* tslint:disable:max-line-length */

    context.subscriptions.push(
        // Register Commands
        customToCustomCommand, vscode.commands.registerCommand('timing.customToCustom', customToCustomCommand.execute, customToCustomCommand),
        customToEpochCommand, vscode.commands.registerCommand('timing.customToEpoch', customToEpochCommand.execute, customToEpochCommand),
        customToIsoLocalCommand, vscode.commands.registerCommand('timing.customToIsoLocal', customToIsoLocalCommand.execute, customToIsoLocalCommand),
        customToIsoUtcCommand, vscode.commands.registerCommand('timing.customToIsoUtc', customToIsoUtcCommand.execute, customToIsoUtcCommand),
        epochToCustomCommand, vscode.commands.registerCommand('timing.epochToCustom', epochToCustomCommand.execute, epochToCustomCommand),
        epochToReadableDurationCommand, vscode.commands.registerCommand('timing.epochToReadableDuration', epochToReadableDurationCommand.execute, epochToReadableDurationCommand),
        epochToIsoDurationCommand, vscode.commands.registerCommand('timing.epochToIsoDuration', epochToIsoDurationCommand.execute, epochToIsoDurationCommand),
        epochToIsoLocalCommand, vscode.commands.registerCommand('timing.epochToIsoLocal', epochToIsoLocalCommand.execute, epochToIsoLocalCommand),
        epochToIsoUtcCommand, vscode.commands.registerCommand('timing.epochToIsoUtc', epochToIsoUtcCommand.execute, epochToIsoUtcCommand),
        isoDurationToEpochCommand, vscode.commands.registerCommand('timing.isoDurationToEpoch', isoDurationToEpochCommand.execute, isoDurationToEpochCommand),
        isoRfcToCustomCommand, vscode.commands.registerCommand('timing.isoRfcToCustom', isoRfcToCustomCommand.execute, isoRfcToCustomCommand),
        isoRfcToEpochCommand, vscode.commands.registerCommand('timing.isoRfcToEpoch', isoRfcToEpochCommand.execute, isoRfcToEpochCommand),
        nowAsCustomCommand, vscode.commands.registerCommand('timing.nowAsCustom', nowAsCustomCommand.execute, nowAsCustomCommand),
        nowAsEpochCommand, vscode.commands.registerCommand('timing.nowAsEpoch', nowAsEpochCommand.execute, nowAsEpochCommand),
        nowAsIsoLocalCommand, vscode.commands.registerCommand('timing.nowAsIsoLocal', nowAsIsoLocalCommand.execute, nowAsIsoLocalCommand),
        nowAsIsoUtcCommand, vscode.commands.registerCommand('timing.nowAsIsoUtc', nowAsIsoUtcCommand.execute, nowAsIsoUtcCommand),

        vscode.commands.registerCommand('timing.toggleInsertConvertedTimeUserLevel', toggleInsertConvertedTimeUserLevelCommand.execute, toggleInsertConvertedTimeUserLevelCommand),
        // Register Hover Provider
        timestampHoverProvider, vscode.languages.registerHoverProvider('*', timestampHoverProvider),
        durationHoverProvider, vscode.languages.registerHoverProvider('*', durationHoverProvider)
    );
    /* tslint:enable:max-line-length */
}

// this method is called when your extension is deactivated
export function deactivate() {
}
