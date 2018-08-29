'use strict';

import * as moment from 'moment';

class TimeConverter {
    public isoRfcToCustom(date: string, targetFormat: string): any {
        const result = moment(date).format(targetFormat);
        return result;
    }

    public epochToCustom(ms: string, targetFormat: string): any {
        const result = moment(ms, 'x').format(targetFormat);
        return result;
    }

    public customToIsoUtc(time: string, format: string): string {
        const result = moment(time, format, true).toISOString(false);
        return result;
    }

    public customToIsoLocal(time: string, format: string): string {
        const result = moment(time, format, true).toISOString(true);
        return result;
    }

    public epochToIsoUtc(ms: string): string {
        const result = moment(ms, 'x').toISOString(false);
        return result;
    }

    public epochToIsoLocal(ms: string): string {
        const result = moment(ms, 'x').toISOString(true);
        return result;
    }

    public isoRfcToEpoch(date: string, targetFormat: string): string {
        let result: number;
        switch (targetFormat) {
            case 's':
                result = moment(date).unix();
                break;
            case 'ms':
                result = moment(date).valueOf();
                break;
            case 'ns':
                result = moment(date).valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + targetFormat + '" detected.');
        }
        return result.toString();
    }

    public customToEpoch(time: string, customFormat: string, epochFormat: string): string {
        let result: number;
        switch (epochFormat) {
            case 's':
                result = moment(time, customFormat, true).unix();
                break;
            case 'ms':
                result = moment(time, customFormat, true).valueOf();
                break;
            case 'ns':
                result = moment(time, customFormat, true).valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + epochFormat + '" detected.');
        }
        return result.toString();
    }

    public isValidEpoch(epoch: string): boolean {
        const result = moment(Number(epoch)).isValid();
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

    public getNowAsEpoch(targetFormat: string): string {
        let result: number;
        switch (targetFormat) {
            case 's':
                result = moment().unix();
                break;
            case 'ms':
                result = moment().valueOf();
                break;
            case 'ns':
                result = moment().valueOf() * 1000000;
                break;
            default:
                throw new Error('Unknown option="' + targetFormat + '" detected.');
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
