'use strict';

class TimeConverter {

    public convertToISO(ms: number): string {
        let result;

        let date = new Date(ms);

        if (!date.getTime()) {
            throw Error('Cannot parse to Date.');
        }

        result = date.toISOString();
        return result;
    }
}

export = TimeConverter;
