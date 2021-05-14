/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

/* eslint-disable prefer-arrow/prefer-arrow-functions */

import * as vscode from 'vscode';

import { CustomToCustomCommand } from './commands/customToCustomCommand';
import { CustomToEpochCommand } from './commands/customToEpochCommand';
import { CustomToIsoLocalCommand } from './commands/customToIsoLocalCommand';
import { CustomToIsoUtcCommand } from './commands/customToIsoUtcCommand';
import { EpochToCustomCommand } from './commands/epochToCustomCommand';
import { EpochToGpsCommand } from './commands/epochToGpsCommand';
import { EpochToISODurationCommand } from './commands/epochToISODurationCommand';
import { EpochToIsoLocalCommand } from './commands/epochToIsoLocalCommand';
import { EpochToIsoTimezoneCommand } from './commands/epochToIsoTimezoneCommand';
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

import { DurationHoverProvider } from './hover/durationHoverProvider';
import { TimestampHoverProvider } from './hover/timestampHoverProvider';
import { ConfigHelper } from './util/configHelper';
import { TimeConverter } from './util/timeConverter';
import { EpochToCustomTimezoneCommand } from './commands/epochToCustomTimezoneCommand';

export function activate(context: vscode.ExtensionContext): void {

    // Create converter
    const timeConverter = new TimeConverter();

    // Create configHelper
    const configHelper = new ConfigHelper();

    // Create commands
    const customToCustomCommand = new CustomToCustomCommand(context, timeConverter, configHelper);
    const customToEpochCommand = new CustomToEpochCommand(context, timeConverter, configHelper);
    const customToIsoUtcCommand = new CustomToIsoUtcCommand(context, timeConverter, configHelper);
    const customToIsoLocalCommand = new CustomToIsoLocalCommand(context, timeConverter, configHelper);
    const epochToCustomCommand = new EpochToCustomCommand(context, timeConverter, configHelper);
    const epochToCustomTimezoneCommand = new EpochToCustomTimezoneCommand(context, timeConverter, configHelper);
    const epochToReadableDurationCommand = new EpochToReadableDurationCommand(context, timeConverter, configHelper);
    const epochToIsoDurationCommand = new EpochToISODurationCommand(context, timeConverter, configHelper);
    const epochToIsoLocalCommand = new EpochToIsoLocalCommand(context, timeConverter, configHelper);
    const epochToIsoUtcCommand = new EpochToIsoUtcCommand(context, timeConverter, configHelper);
    const epochToIsoTimezoneCommand = new EpochToIsoTimezoneCommand(context, timeConverter, configHelper);
    const epochToGpsCommand = new EpochToGpsCommand(context, timeConverter, configHelper);
    const nowAsEpochCommand = new NowAsEpochCommand(context, timeConverter, configHelper);
    const nowAsCustomCommand = new NowAsCustomCommand(context, timeConverter, configHelper);
    const nowAsIsoLocalCommand = new NowAsIsoLocalCommand(context, timeConverter, configHelper);
    const nowAsIsoUtcCommand = new NowAsIsoUtcCommand(context, timeConverter, configHelper);
    const isoDurationToEpochCommand = new IsoDurationToEpochCommand(context, timeConverter, configHelper);
    const isoRfcToCustomCommand = new IsoRfcToCustomCommand(context, timeConverter, configHelper);
    const isoRfcToEpochCommand = new IsoRfcToEpochCommand(context, timeConverter, configHelper);

    const toggleInsertConvertedTimeUserLevelCommand = new ToggleInsertConvertedTimeUserLevelCommand();

    const timestampHoverProvider = new TimestampHoverProvider(timeConverter, configHelper);
    const durationHoverProvider = new DurationHoverProvider(timeConverter, configHelper);

    /* tslint:disable:max-line-length */

    context.subscriptions.push(
        // Register Commands
        customToCustomCommand, vscode.commands.registerCommand('timing.customToCustom', customToCustomCommand.execute, customToCustomCommand),
        customToEpochCommand, vscode.commands.registerCommand('timing.customToEpoch', customToEpochCommand.execute, customToEpochCommand),
        customToIsoLocalCommand, vscode.commands.registerCommand('timing.customToIsoLocal', customToIsoLocalCommand.execute, customToIsoLocalCommand),
        customToIsoUtcCommand, vscode.commands.registerCommand('timing.customToIsoUtc', customToIsoUtcCommand.execute, customToIsoUtcCommand),
        epochToCustomCommand, vscode.commands.registerCommand('timing.epochToCustom', epochToCustomCommand.execute, epochToCustomCommand),
        epochToCustomTimezoneCommand, vscode.commands.registerCommand('timing.epochToCustomTimezone', epochToCustomTimezoneCommand.execute, epochToCustomTimezoneCommand),
        epochToReadableDurationCommand, vscode.commands.registerCommand('timing.epochToReadableDuration', epochToReadableDurationCommand.execute, epochToReadableDurationCommand),
        epochToIsoDurationCommand, vscode.commands.registerCommand('timing.epochToIsoDuration', epochToIsoDurationCommand.execute, epochToIsoDurationCommand),
        epochToIsoLocalCommand, vscode.commands.registerCommand('timing.epochToIsoLocal', epochToIsoLocalCommand.execute, epochToIsoLocalCommand),
        epochToIsoUtcCommand, vscode.commands.registerCommand('timing.epochToIsoTimezone', epochToIsoTimezoneCommand.execute, epochToIsoTimezoneCommand),
        epochToIsoUtcCommand, vscode.commands.registerCommand('timing.epochToIsoUtc', epochToIsoUtcCommand.execute, epochToIsoUtcCommand),
        epochToGpsCommand, vscode.commands.registerCommand('timing.epochToGps', epochToGpsCommand.execute, epochToGpsCommand),
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
        durationHoverProvider, vscode.languages.registerHoverProvider('*', durationHoverProvider),

        configHelper
    );
    /* tslint:enable:max-line-length */
}

// this method is called when your extension is deactivated
export function deactivate(): void {
}
