/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as moment from 'moment';
import { Constants } from '../util/constants';

class TimeConverter {
    public isoRfcToCustom(date: string, targetFormat: string): any {
        const result = moment(date).format(targetFormat);
        return result;
    }

    public epochToCustom(ms: string, targetFormat: string): any {
        const result = moment(ms, 'x').format(targetFormat);
        return result;
    }

    public customToISOUtc(time: string, format: string): string {
        const result = moment(time, format, true).toISOString(false);
        return result;
    }

    public customToISOLocal(time: string, format: string): string {
        const result = moment(time, format, true).toISOString(true);
        return result;
    }

    public customToCustom(time: string, sourceFormat: string, targetFormat: string): any {
        const result = moment(time, sourceFormat, true).format(targetFormat);
        return result;
    }

    public epochToISOUtc(ms: string): string {
        const result = moment(ms, 'x').toISOString(false);
        return result;
    }

    public epochToISODuration(ms: number): string {
        const duration = moment.duration(ms).toISOString();
        return duration;
    }

    public epochToReadableDuration(ms: number): string {
        const duration = moment.duration(ms);

        let text = '';

        if (Math.floor(duration.asDays() / 7) !== 0) {
            text += Math.floor(duration.asDays() / 7) + 'w';
        }
        if (text !== '') {
            text += ', ' + Math.floor(duration.asDays() % 7) + 'd';
        } else if (Math.floor(duration.asDays() % 7) !== 0) {
            text += Math.floor(duration.asDays() % 7) + 'd';
        }
        if (text !== '') {
            text += ', ' + duration.hours() + 'h';
        } else if (duration.hours() !== 0) {
            text += duration.hours() + 'h';
        }
        if (text !== '') {
            text += ', ' + duration.minutes() + 'min';
        } else if (duration.minutes() !== 0) {
            text += duration.minutes() + 'min';
        }
        if (text !== '') {
            text += ', ' + duration.seconds() + Constants.SECONDS;
        } else if (duration.seconds() !== 0) {
            text += duration.seconds() + Constants.SECONDS;
        }
        if (text !== '') {
            text += ', ' + duration.milliseconds() + Constants.MILLISECONDS;
        } else {
            text += duration.milliseconds() + Constants.MILLISECONDS;
        }

        return text;
    }
    public epochToIsoLocal(ms: string): string {
        const result = moment(ms, 'x').toISOString(true);
        return result;
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
            case Constants.NANOSECONDS:
                result = moment(date).valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + targetUnit + '" detected.');
        }
        return result.toString();
    }

    public customToEpoch(time: string, customFormat: string, epochFormat: string): string {
        let result: number;
        switch (epochFormat) {
            case Constants.SECONDS:
                result = moment(time, customFormat, true).unix();
                break;
            case Constants.MILLISECONDS:
                result = moment(time, customFormat, true).valueOf();
                break;
            case Constants.NANOSECONDS:
                result = moment(time, customFormat, true).valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + epochFormat + '" detected.');
        }
        return result.toString();
    }

    public isValidEpoch(epoch: string): boolean {
        let result = false;
        if (/^\d+$/.test(epoch)) {
            result = true;
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
