'use strict';

import * as assert from 'assert';
import { InputDefinition } from '../inputDefinition';

describe('InputDefinition', () => {
    describe('constructor', () => {
        it('Should treat input as seconds.', () => {
            const result = new InputDefinition('123456789');

            assert.equal(result.inputAsMs, 123456789000);
            assert.equal(result.originalUnit, 's');
            assert.equal(result.originalInput, '123456789');
        });

        it('Should treat input as milliseconds.', () => {
            const result = new InputDefinition('123456789000');

            assert.equal(result.inputAsMs, 123456789000);
            assert.equal(result.originalUnit, 'ms');
            assert.equal(result.originalInput, '123456789000');
        });

        it('Should treat input as nanoseconds.', () => {
            const result = new InputDefinition('123456789123456789');

            assert.equal(result.inputAsMs, 123456789123.456789);
            assert.equal(result.originalUnit, 'ns');
            assert.equal(result.originalInput, '123456789123456789');
        });

        it('Should throw if to many digits are detected.', () => {
            assert.throws(() => new InputDefinition('123456789123456789123456789123456789'));
        });

        it('Should treat input as ISO 8601 date.', () => {
            const result = new InputDefinition('1973-11-29T21:33:09.123Z');

            assert.equal(result.inputAsMs, undefined);
            assert.equal(result.originalUnit, undefined);
            assert.equal(result.originalInput, '1973-11-29T21:33:09.123Z');
        });

        it('Should initialize with undefined.', () => {
            const result = new InputDefinition(undefined);

            assert.equal(result.inputAsMs, undefined);
            assert.equal(result.originalUnit, undefined);
            assert.equal(result.originalInput, undefined);
        });

    });
});
