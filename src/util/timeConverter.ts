/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as moment from 'moment-timezone';
import { Constants } from '../util/constants';
import { InputDefinition } from './inputDefinition';
import * as gpsTime from 'gps-time';

class TimeConverter {
    public isoRfcToCustom(date: string, targetFormat: string): string {
        const result = moment(date).format(targetFormat);
        return result;
    }

    // Boolean to fulfill deprecated "localize" option
    public epochToCustom(epoch: string, targetFormat: string, timezone: boolean | string = ''): string {
        const ms = new InputDefinition(epoch).inputAsMs;
        let result: string;

        if (typeof timezone === 'string') {
            if (Constants.UTCOFFSETS.includes(timezone)) {
                result = moment(ms, 'x').utcOffset(timezone).format(targetFormat);
            } else if (Constants.TIMEZONES.includes(timezone)) {
                result = moment(ms, 'x').tz(timezone).format(targetFormat);
            } else {
                result = moment(ms, 'x').format(targetFormat); // By default localize format
            }
        } else {
            // Handle deprecated data contract
            if (timezone) {
                result = moment(ms, 'x').format(targetFormat);
            } else {
                result = moment.utc(ms, 'x').format(targetFormat);
            }
        }

        return result;
    }

    public customToISOUtc(format: string, time: string): string {
        const result = moment(time, format, true).toISOString(false);
        return result;
    }

    public customToISOLocal(format: string, time: string): string {
        const result = moment(time, format, true).toISOString(true);
        return result;
    }

    public customToCustom(sourceFormat: string, time: string, targetFormat: string): string {
        const result = moment(time, sourceFormat, true).format(targetFormat);
        return result;
    }

    public epochToISOUtc(epoch: string): string {
        const ms = new InputDefinition(epoch).inputAsMs;
        const result = moment(ms, 'x').toISOString(false);
        return result;
    }

    public epochToISODuration(epoch: string, unit: string): string {
        const ms = new InputDefinition(epoch, unit).inputAsMs;
        const duration = moment.duration(ms).toISOString();
        return duration;
    }

    public epochToReadableDuration(epoch: string, unit: string): string {
        const ms = new InputDefinition(epoch, unit).inputAsMs;
        const duration = moment.duration(ms);

        let text = '';

        if (Math.floor(duration.asDays() / 7) !== 0) {
            text += `${Math.floor(duration.asDays() / 7)}w`;
        }
        if (text !== '') {
            text += `, ${Math.floor(duration.asDays() % 7)}d`;
        } else if (Math.floor(duration.asDays() % 7) !== 0) {
            text += `${Math.floor(duration.asDays() % 7)}d`;
        }
        if (text !== '') {
            text += `, ${duration.hours()}h`;
        } else if (duration.hours() !== 0) {
            text += `${duration.hours()}h`;
        }
        if (text !== '') {
            text += `, ${duration.minutes()}min`;
        } else if (duration.minutes() !== 0) {
            text += `${duration.minutes()}min`;
        }
        if (text !== '') {
            text += `, ${duration.seconds()}${Constants.SECONDS}`;
        } else if (duration.seconds() !== 0) {
            text += `${duration.seconds()}${Constants.SECONDS}`;
        }
        if (text !== '') {
            text += `, ${duration.milliseconds()}${Constants.MILLISECONDS}`;
        } else {
            text += `${duration.milliseconds()}${Constants.MILLISECONDS}`;
        }

        return text;
    }

    public epochToIsoLocal(epoch: string): string {
        const ms = new InputDefinition(epoch).inputAsMs;
        const result = moment(ms, 'x').toISOString(true);
        return result;
    }

    public epochToGps(epoch: string): string {
        const def = new InputDefinition(epoch)
        const ms = def.inputAsMs;
        let result: number;
        switch (def.originalUnit) {
            case Constants.SECONDS:
                result = gpsTime.toGPSMS(ms) / 1000;
                break;
            case Constants.MILLISECONDS:
                result = gpsTime.toGPSMS(ms);
                break;
            case Constants.MICROSECONDS:
                result = gpsTime.toGPSMS(ms) * 1000;
                break;
            case Constants.NANOSECONDS:
                result = gpsTime.toGPSMS(ms) * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + def.originalUnit + '" detected.');
        }
        return result.toString();
    }

    public isoDurationToEpoch(duration: string, targetUnit: string): string {
        let result: number;
        switch (targetUnit) {
            case Constants.SECONDS:
                result = moment.duration(duration).asSeconds();
                break;
            case Constants.MILLISECONDS:
                result = moment.duration(duration).asMilliseconds();
                break;
            case Constants.MICROSECONDS:
                result = moment.duration(duration).asMilliseconds() * 1000;
                break;
            case Constants.NANOSECONDS:
                result = moment.duration(duration).asMilliseconds() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + targetUnit + '" detected.');
        }
        return result.toString();
    }

    public isoRfcToEpoch(date: string, targetUnit: string): string {
        let result: number;
        switch (targetUnit) {
            case Constants.SECONDS:
                result = moment(date).unix();
                break;
            case Constants.MILLISECONDS:
                result = moment(date).valueOf();
                break;
            case Constants.MICROSECONDS:
                result = moment(date).valueOf() * 1000;
                break;
            case Constants.NANOSECONDS:
                result = moment(date).valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + targetUnit + '" detected.');
        }
        return result.toString();
    }

    public customToEpoch(customFormat: string, time: string, epochFormat: string): string {
        let result: number;
        switch (epochFormat) {
            case Constants.SECONDS:
                result = moment(time, customFormat, true).unix();
                break;
            case Constants.MILLISECONDS:
                result = moment(time, customFormat, true).valueOf();
                break;
            case Constants.MICROSECONDS:
                result = moment(time, customFormat, true).valueOf() * 1000;
                break;
            case Constants.NANOSECONDS:
                result = moment(time, customFormat, true).valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + epochFormat + '" detected.');
        }
        return result.toString();
    }

    public epochToISOTimezone(epoch: string, timezone: string): string {
        const ms = new InputDefinition(epoch).inputAsMs;
        let result: string;

        if (Constants.UTCOFFSETS.includes(timezone)) {
            result = moment(ms, 'x').utcOffset(timezone).toISOString(true);
        } else if (Constants.TIMEZONES.includes(timezone)) {
            result = moment(ms, 'x').tz(timezone).toISOString(true);
        } else {
            throw new Error(`Received unknown timezone="${timezone}".`);
        }

        return result;
    }

    public isValidEpoch(epoch: string): boolean {
        let result = false;
        if (/^\d+$/.test(epoch)) {
            const input = new InputDefinition(epoch);
            // To check whether one set of epochConversionBoundaries are met.
            result = Boolean(input.inputAsMs && input.originalUnit);
        }
        return result;
    }

    public isValidISODuration(duration: string): boolean {
        let result = false;
        if (duration) {
            result = moment.duration(duration).isValid();
        }
        return result;
    }

    public isValidIsoRfc(date: string): boolean {
        let result = false;
        if (date !== undefined) {
            result = moment(date).isValid();
        }
        return result;
    }

    public isValidCustom(time: string, customFormat: string): boolean {
        let result: boolean = false;
        if (time && customFormat) {
            try {
                result = moment(time, customFormat, true).isValid();
            } catch (e) { }
        }
        return result;
    }

    public isValidTimezone(timezone: string): boolean {
        return Constants.TIMEZONES.concat(Constants.UTCOFFSETS).includes(timezone);
    }

    public getNowAsCustom(targetFormat: string): string {
        const result = moment().format(targetFormat);
        return result;
    }

    public getNowAsEpoch(targetUnit: string): string {
        let result: number;
        switch (targetUnit) {
            case Constants.SECONDS:
                result = moment().unix();
                break;
            case Constants.MILLISECONDS:
                result = moment().valueOf();
                break;
            case Constants.MICROSECONDS:
                result = moment().valueOf() * 1000;
                break;
            case Constants.NANOSECONDS:
                result = moment().valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + targetUnit + '" detected.');
        }
        return result.toString();
    }

    public getNowAsIsoUtc(): string {
        const result = moment().toISOString(false);
        return result;
    }

    public getNowAsIsoLocal(): string {
        const result = moment().toISOString(true);
        return result;
    }
}

export { TimeConverter };
