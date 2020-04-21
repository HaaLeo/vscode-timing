/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as assert from 'assert';
import { InputDefinition } from '../../util/inputDefinition';

describe('InputDefinition', () => {
    describe('constructor', () => {
        describe('without optional unit', () => {
            it('Should treat input as seconds.', () => {
                const result = new InputDefinition('123456789');

                assert.strictEqual(result.inputAsMs, 123456789000);
                assert.strictEqual(result.originalUnit, 's');
                assert.strictEqual(result.originalInput, '123456789');
            });

            it('Should treat input as milliseconds.', () => {
                const result = new InputDefinition('123456789000');

                assert.strictEqual(result.inputAsMs, 123456789000);
                assert.strictEqual(result.originalUnit, 'ms');
                assert.strictEqual(result.originalInput, '123456789000');
            });

            it('Should treat input as microseconds.', () => {
                const result = new InputDefinition('123456789123456');

                assert.strictEqual(result.inputAsMs, 123456789123.456);
                assert.strictEqual(result.originalUnit, 'μs');
                assert.strictEqual(result.originalInput, '123456789123456');
            });

            it('Should treat input as nanoseconds.', () => {
                const result = new InputDefinition('123456789123456789');

                assert.strictEqual(result.inputAsMs, 123456789123.456789);
                assert.strictEqual(result.originalUnit, 'ns');
                assert.strictEqual(result.originalInput, '123456789123456789');
            });

            it('Should initialize with undefined if to many digits are detected.', () => {
                const result = new InputDefinition('123456789123456789123456789123456789');

                assert.strictEqual(result.inputAsMs, undefined);
                assert.strictEqual(result.originalUnit, undefined);
                assert.strictEqual(result.originalInput, '123456789123456789123456789123456789');
            });

            it('Should treat input as ISO 8601 date.', () => {
                const result = new InputDefinition('1973-11-29T21:33:09.123Z');

                assert.strictEqual(result.inputAsMs, undefined);
                assert.strictEqual(result.originalUnit, undefined);
                assert.strictEqual(result.originalInput, '1973-11-29T21:33:09.123Z');
            });

            it('Should initialize with undefined.', () => {
                const result = new InputDefinition(undefined);

                assert.strictEqual(result.inputAsMs, undefined);
                assert.strictEqual(result.originalUnit, undefined);
                assert.strictEqual(result.originalInput, undefined);
            });
        });

        describe('with optional unit', () => {
            it('Should treat input as seconds.', () => {
                const result = new InputDefinition('1', 's');

                assert.strictEqual(result.inputAsMs, 1000);
                assert.strictEqual(result.originalUnit, 's');
                assert.strictEqual(result.originalInput, '1');
            });

            it('Should treat input as milliseconds.', () => {
                const result = new InputDefinition('1', 'ms');

                assert.strictEqual(result.inputAsMs, 1);
                assert.strictEqual(result.originalUnit, 'ms');
                assert.strictEqual(result.originalInput, '1');
            });

            it('Should treat input as microseconds.', () => {
                const result = new InputDefinition('1', 'μs');

                assert.strictEqual(result.inputAsMs, 0.001);
                assert.strictEqual(result.originalUnit, 'μs');
                assert.strictEqual(result.originalInput, '1');
            });

            it('Should treat input as nanoseconds.', () => {
                const result = new InputDefinition('1', 'ns');

                assert.strictEqual(result.inputAsMs, 0.000001);
                assert.strictEqual(result.originalUnit, 'ns');
                assert.strictEqual(result.originalInput, '1');
            });

            it('Should throw if unknown unit detected.', () => {
                assert.throws(() => new InputDefinition('1', 'invalid'));
            });

            it('Should treat input as ISO 8601 date.', () => {
                const result = new InputDefinition('1973-11-29T21:33:09.123Z');

                assert.strictEqual(result.inputAsMs, undefined);
                assert.strictEqual(result.originalUnit, undefined);
                assert.strictEqual(result.originalInput, '1973-11-29T21:33:09.123Z');
            });

            it('Should initialize with undefined.', () => {
                const result = new InputDefinition(undefined);

                assert.strictEqual(result.inputAsMs, undefined);
                assert.strictEqual(result.originalUnit, undefined);
                assert.strictEqual(result.originalInput, undefined);
            });

        });
    });
});
