'use strict';

import * as moment from 'moment';

class TimeConverter {

    public epochToIsoUtc(ms: number): string {
        const result = moment(ms).toISOString(false);
        return result;
    }

    public epochToIsoLocal(ms: number): string {
        const result = moment(ms).toISOString(true);
        return result;
    }

    public isoRfcToEpoch(date: string): number {
        const result = moment(date).valueOf();
        return result;
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

export = TimeConverter;
