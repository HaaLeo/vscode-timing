'use strict';

class InputDefinition {
    private _inputAsMs: number;
    private _originalUnit: string;

    constructor(userInput: string) {
        this.initialize(userInput);
    }

    public get inputAsMs(): number {
        return this._inputAsMs;
    }

    public get originalUnit(): string {
        return this._originalUnit;
    }

    private initialize(userInput: string) {
        if (userInput.length <= 11) {
            this._inputAsMs = Number(userInput) * 1000;
            this._originalUnit = 's';
        } else if (userInput.length <= 14) {
            this._inputAsMs = Number(userInput);
            this._originalUnit = 'ms';
        } else if (userInput.length <= 21) {
            this._inputAsMs = Number(userInput) / 1000000;
            this._originalUnit = 'ns';
        } else {
            throw Error('Unknown format: number with ' + userInput.length + ' digits.');
        }
    }
}

export = InputDefinition;
