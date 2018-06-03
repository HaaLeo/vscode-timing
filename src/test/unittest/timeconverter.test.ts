'use strict';

import * as assert from 'assert';
import TimeConverter = require('../../timeConverter');

describe('TimeConverter', () => {
    describe('convertToISO', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should convert to ISO correctly.', () => {
            const result = testObject.epochToIsoUtc(123456789000);
            assert.equal(result, '1973-11-29T21:33:09.000Z');
        });
    });
});
