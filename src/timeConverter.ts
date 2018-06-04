'use strict';

import * as moment from 'moment';

class TimeConverter {

    public epochToIsoUtc(ms: string, option?: string): string {
        const result = moment(ms, 'x').toISOString(false);
        return result;
    }

    public epochToIsoLocal(ms: string, option?: string): string {
        const result = moment(ms, 'x').toISOString(true);
        return result;
    }

    public isoRfcToEpoch(date: string, option?: string): string {
        let result: number;
        switch (option) {
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
                throw new Error('Unknown option="' + option + '" detected.');
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
}

export { TimeConverter };
