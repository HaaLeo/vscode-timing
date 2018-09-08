/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import * as moment from 'moment';
import { TimeConverter } from '../../util/timeConverter';

describe('TimeConverter', () => {
    describe('epochToIsoUtc', () => {
        it('Should convert to ISO correctly.', () => {
            const testObject = new TimeConverter();

            const result = testObject.epochToIsoUtc('123456789000');

            assert.equal(result, '1973-11-29T21:33:09.000Z');
        });
    });

    describe('epochToIsoLocal', () => {
        it('Should convert to ISO correctly.', () => {
            const testObject = new TimeConverter();
            const result = testObject.epochToIsoLocal('123456789000');
            assert.equal(result, moment('1973-11-29T21:33:09.000Z').toISOString(true));
        });
    });

    describe('epochToCustom', () => {
        it('Should convert to ISO correctly.', () => {
            const testObject = new TimeConverter();
            const result = testObject.epochToCustom('123456789000', 'YYYY');
            assert.equal(result, '1973');
        });
    });

    describe('isoRfcToEpoch', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should convert to epoch correctly as s.', () => {
            const result = testObject.isoRfcToEpoch('1973-11-29T21:33:09.000Z', 's');

            assert.equal(result, '123456789');
        });

        it('Should convert to epoch correctly as ms.', () => {
            const result = testObject.isoRfcToEpoch('1973-11-29T21:33:09.000Z', 'ms');

            assert.equal(result, '123456789000');
        });

        it('Should convert to epoch correctly as ns.', () => {
            const result = testObject.isoRfcToEpoch('1973-11-29T21:33:09.000Z', 'ns');

            assert.equal(result, '123456789000000000');
        });

        it('Should throw an error if option is unknown.', () => {
            const result = testObject.isoRfcToEpoch('1973-11-29T21:33:09.000Z', 'ns');

            assert.throws(() => testObject.isoRfcToEpoch('1973-11-29T21:33:09.000Z', undefined));
        });
    });

    describe('isoRfcToCustom', () => {
        it('Should convert to ISO correctly.', () => {
            const testObject = new TimeConverter();
            const result = testObject.isoRfcToCustom('1973-11-29T21:33:09.000Z', 'YYYY-MM-DD');
            assert.equal(result, '1973-11-29');
        });
    });

    describe('customToEpoch', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should convert to epoch correctly as s.', () => {
            const result = testObject.customToEpoch('2018/07/07', 'YYYY/MM/DD', 's');

            assert.equal(result, moment('2018/07/07', 'YYYY/MM/DD').unix());
        });

        it('Should convert to epoch correctly as ms.', () => {
            const result = testObject.customToEpoch('2018/07/07', 'YYYY/MM/DD', 'ms');

            assert.equal(result, moment('2018/07/07', 'YYYY/MM/DD').valueOf());
        });

        it('Should convert to epoch correctly as ns.', () => {
            const result = testObject.customToEpoch('2018/07/07', 'YYYY/MM/DD', 'ns');

            assert.equal(result, moment('2018/07/07', 'YYYY/MM/DD').valueOf() * 1000000);
        });

        it('Should throw an error if option is unknown.', () => {
            assert.throws(() => testObject.customToEpoch('2018/07/07', 'YYYY/MM/DD', undefined));
        });
    });

    describe('customToIsoLocal', () => {
        it('Should convert to ISO Local correctly.', () => {
            const testObject = new TimeConverter();
            const result = testObject.customToIsoLocal('2018-05-05', 'YYYY-MM-DD');
            assert.equal(result, moment('2018-05-05', 'YYYY-MM-DD').toISOString(true));
        });
    });

    describe('customToIsoUtc', () => {
        it('Should convert to ISO UTC correctly.', () => {
            const testObject = new TimeConverter();
            const result = testObject.customToIsoUtc('2018-05-05', 'YYYY-MM-DD');
            assert.equal(result, moment('2018-05-05', 'YYYY-MM-DD').toISOString(false));
        });
    });

    describe('isValidEpoch', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should return true if it is a valid epoch time.', () => {
            assert.equal(true, testObject.isValidEpoch('123456789'));
        });

        it('Should return false if it is an invalid epoch time.', () => {
            assert.equal(false, testObject.isValidEpoch('1973-11-29T21:33:09.000Z'));
        });
    });

    describe('isValidIsoRfc', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should return true if it is a valid ISO time.', () => {
            assert.equal(testObject.isValidIsoRfc('1973-11-29T21:33:09.000Z'), true);
        });

        it('Should return false if it is an invalid ISO time.', () => {
            assert.equal(testObject.isValidIsoRfc('123456789'), false);
        });
    });

    describe('isValidCustom', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should return true if it is a valid custom time.', () => {
            assert.equal(testObject.isValidCustom('2018/07/07', 'YYYY/MM/DD'), true);
        });

        it('Should return false if it is an invalid custom time.', () => {
            assert.equal(testObject.isValidCustom('123456789', 'YYYY/MM/DD'), false);
        });

        it('Should return false if it is undefined.', () => {
            assert.equal(testObject.isValidCustom(undefined, 'YYYY/MM/DD'), false);
            assert.equal(testObject.isValidCustom('1232342', undefined), false);
        });

    });

    describe('getNowAsCustom', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should return current time in custom format.', () => {
            const now = moment(moment().format('YYYY/MM/DD'), 'YYYY/MM/DD').unix();
            const result = testObject.getNowAsCustom('YYYY/MM/DD');

            assert.equal(now <= moment(result, 'YYYY/MM/DD').unix(), true);
        });
    });

    describe('getNowAsEpoch', () => {
        let testObject: TimeConverter;

        beforeEach('Set up test object.', () => {
            testObject = new TimeConverter();
        });

        it('Should return current epoch time as seconds.', () => {
            const now = moment().unix();
            const result = testObject.getNowAsEpoch('s');
            assert.equal(isNaN(Number(result)), false);
            assert.equal(now <= Number(result), true);
        });

        it('Should return current epoch time as milliseconds.', () => {
            const now = moment().valueOf();
            const result = testObject.getNowAsEpoch('ms');
            assert.equal(isNaN(Number(result)), false);
            assert.equal(now <= Number(result), true);
        });

        it('Should return current epoch time as milliseconds.', () => {
            const now = moment().valueOf() * 1000000;
            const result = testObject.getNowAsEpoch('ns');
            assert.equal(isNaN(Number(result)), false);
            assert.equal(now <= Number(result), true);
        });

        it('Should throw an exception if epoch format is not known.', () => {
            assert.throws(() => testObject.getNowAsEpoch('invalid Format'));
        });
    });

    describe('getNowAsIsoUtc', () => {

        it('Should return current time in ISO UTC format.', () => {
            const testObject = new TimeConverter();
            const now = moment();
            const result = testObject.getNowAsIsoUtc();

            assert.equal(moment(result).isSameOrAfter(now), true);
        });

        it('Should return current time in ISO Local format.', () => {
            const testObject = new TimeConverter();
            const now = moment();
            const result = testObject.getNowAsIsoLocal();

            assert.equal(moment(result).isLocal(), true);
            assert.equal(moment(result).isSameOrAfter(now), true);
        });
    });
});
