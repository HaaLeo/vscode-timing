'use strict';

import * as sinon from 'sinon';
import { TimeConverter } from '../../util/timeConverter';

class TimeConverterMock implements TimeConverter {
    public isoRfcToCustom = sinon.stub();
    public epochToCustom = sinon.stub();
    public customToIsoUtc = sinon.stub();
    public customToIsoLocal = sinon.stub();
    public epochToIsoUtc = sinon.stub();
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
        this.isoRfcToCustom.reset();
        this.epochToCustom.reset();
        this.customToIsoUtc.reset();
        this.customToIsoLocal.reset();
        this.epochToIsoUtc.reset();
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

    public restore() {
        this.isoRfcToCustom.restore();
        this.epochToCustom.restore();
        this.customToIsoUtc.restore();
        this.customToIsoLocal.restore();
        this.epochToIsoUtc.restore();
        this.epochToIsoLocal.restore();
        this.isoRfcToEpoch.restore();
        this.customToEpoch.restore();
        this.isValidEpoch.restore();
        this.isValidIsoRfc.restore();
        this.isValidCustom.restore();
        this.getNowAsCustom.restore();
        this.getNowAsEpoch.restore();
        this.getNowAsIsoUtc.restore();
        this.getNowAsIsoLocal.restore();
    }
}
export { TimeConverterMock };
