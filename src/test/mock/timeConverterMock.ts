/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as sinon from 'sinon';
import { TimeConverter } from '../../util/timeConverter';

class TimeConverterMock implements TimeConverter {
    public customToCustom = sinon.stub();
    public isoDurationToEpoch = sinon.stub();
    public isValidISODuration = sinon.stub();
    public epochToISODuration = sinon.stub();
    public epochToReadableDuration = sinon.stub();
    public isoRfcToCustom = sinon.stub();
    public epochToCustom = sinon.stub();
    public customToISOUtc = sinon.stub();
    public customToISOLocal = sinon.stub();
    public epochToISOUtc = sinon.stub();
    public epochToIsoLocal = sinon.stub();
    public isoRfcToEpoch = sinon.stub();
    public customToEpoch = sinon.stub();
    public isValidEpoch = sinon.stub();
    public isValidIsoRfc = sinon.stub();
    public isValidCustom = sinon.stub();
    public getNowAsCustom = sinon.stub();
    public getNowAsEpoch = sinon.stub();
    public getNowAsIsoUtc = sinon.stub();
    public getNowAsIsoLocal = sinon.stub();

    public reset() {
        this.customToCustom.reset();
        this.isoDurationToEpoch.reset();
        this.isValidISODuration.reset();
        this.epochToISODuration.reset();
        this.epochToReadableDuration.reset();
        this.isoRfcToCustom.reset();
        this.epochToCustom.reset();
        this.customToISOUtc.reset();
        this.customToISOLocal.reset();
        this.epochToISOUtc.reset();
        this.epochToIsoLocal.reset();
        this.isoRfcToEpoch.reset();
        this.customToEpoch.reset();
        this.isValidEpoch.reset();
        this.isValidIsoRfc.reset();
        this.isValidCustom.reset();
        this.getNowAsCustom.reset();
        this.getNowAsEpoch.reset();
        this.getNowAsIsoUtc.reset();
        this.getNowAsIsoLocal.reset();
    }
}
export { TimeConverterMock };
