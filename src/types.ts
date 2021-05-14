/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

interface ICustomFormat {
    format: string;
    description?: string;
    detail?: string;
}

interface ICustomHoverFormat {
    customFormat: string;
    name?: string;
    localize?: boolean; // DEPRECATED
    timezone?: string;
}

interface IEpochConversionBoundaries {
    seconds?: { min: number; max: number };
    milliseconds?: { min: number; max: number };
    microseconds?: { min: number; max: number };
    nanoseconds?: { min: number; max: number };
}

interface ICommandOptions {
    sourceFormat?: string;
    targetFormat?: string;
    sourceUnit?: 's' | 'ms' | 'ns';
    targetUnit?: 's' | 'ms' | 'ns';
    timezone?: string;
}

// Until https://github.com/davidcalhoun/gps-time.js/issues/4 is resolved.
declare module 'gps-time' {
    export function toGPSMS(unixMS: number): number;
    export function toUnixMS(gpsMS: number): number;
}
