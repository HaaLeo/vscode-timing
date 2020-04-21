/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { Constants } from './constants';
import { ConfigHelper } from './configHelper';

class InputDefinition {
    private _inputAsMs: number;
    private _originalUnit: string;
    private _originalInput: string;

    public constructor(userInput: string, unit?: string) {
        this.initialize(userInput, unit);
    }

    public get inputAsMs(): number {
        return this._inputAsMs;
    }

    public get originalUnit(): string {
        return this._originalUnit;
    }

    public get originalInput(): string {
        return this._originalInput;
    }

    private initialize(userInput: string, unit?: string): void {
        this._originalInput = userInput;
        this._originalUnit = undefined;
        this._inputAsMs = undefined;

        // If unit is given convert number to ms and set original unit
        if (userInput && !isNaN(Number(userInput))) {
            if (unit) {
                this._originalUnit = unit;
                switch (unit) {
                    case Constants.SECONDS:
                        this._inputAsMs = Number(userInput) * 1000;
                        break;
                    case Constants.MILLISECONDS:
                        this._inputAsMs = Number(userInput);
                        break;
                    case Constants.MICROSECONDS:
                        this._inputAsMs = Number(userInput) / 1000;
                        break;
                    case Constants.NANOSECONDS:
                        this._inputAsMs = Number(userInput) / 1000000;
                        break;
                    default:
                        throw Error(`Unknown format="${unit}" was given.`);
                }
                // If unit is not given, determine it by checking the length
            } else {
                const conversionBoundaries = ConfigHelper.get<IEpochConversionBoundaries>('timing.epochConversionBoundaries');
                if (conversionBoundaries.seconds && userInput.length <= conversionBoundaries.seconds.max && userInput.length >= conversionBoundaries.seconds.min) {
                    this._inputAsMs = Number(userInput) * 1000;
                    this._originalUnit = Constants.SECONDS;
                } else if (conversionBoundaries.milliseconds && userInput.length <= conversionBoundaries.milliseconds.max && userInput.length >= conversionBoundaries.milliseconds.min) {
                    this._inputAsMs = Number(userInput);
                    this._originalUnit = Constants.MILLISECONDS;
                } else if (conversionBoundaries.microseconds && userInput.length <= conversionBoundaries.microseconds.max && userInput.length >= conversionBoundaries.microseconds.min) {
                    this._inputAsMs = Number(userInput) / 1000;
                    this._originalUnit = Constants.MICROSECONDS;
                } else if (conversionBoundaries.nanoseconds && userInput.length <= conversionBoundaries.nanoseconds.max && userInput.length >= conversionBoundaries.nanoseconds.min) {
                    this._inputAsMs = Number(userInput) / 1000000;
                    this._originalUnit = Constants.NANOSECONDS;
                }
            }
        }
    }
}

export { InputDefinition };
