'use strict';

class TimeConverter {

    public convertToISO(ms: number): string {
        let result;

        const date = new Date(ms);

        if (!date.getTime()) {
            throw Error('Cannot parse to Date.');
        }

        result = date.toISOString();
        return result;
    }
}

export = TimeConverter;
