'use strict';

import * as assert from 'assert';
import InputDefinition = require('../../inputdefinition');

describe('InputDefinition', () => {
    describe('constructor', () => {
        it('Should treat input as seconds.', () => {
            const result = new InputDefinition('123456789');

            assert.equal(result.inputAsMs, 123456789000);
            assert.equal(result.originalUnit, 's');
        });

        it('Should treat input as milliseconds.', () => {
            const result = new InputDefinition('123456789000');

            assert.equal(result.inputAsMs, 123456789000);
            assert.equal(result.originalUnit, 'ms');
        });

        it('Should treat input as nanoseconds.', () => {
            const result = new InputDefinition('123456789123456789');

            assert.equal(result.inputAsMs, 123456789123.456789);
            assert.equal(result.originalUnit, 'ns');
        });

    });
});
