'use strict';

import { InputDefinition } from '../inputDefinition';
import { CommandBase } from './commandBase';

class IsoRfcToEpochCommand extends CommandBase {

    public execute(): void {
        this._dialogHandler.configure(
            this._timeConverter.isValidIsoRfc,
            'Ensure the inserted time is valid.',
            this._timeConverter.isoRfcToEpoch,
            '1970-01-01T00:00:00.000Z',
            'Insert a ISO 8601 or RFC 2282 time.',
            ['s', 'ms', 'ns']
        );

        const userInput = this.isInputSelected(this._timeConverter.isValidIsoRfc);
        if (userInput === undefined) {
            this._dialogHandler.showInputDialog();
        } else {
            this._dialogHandler.showOptionsDialog(new InputDefinition(userInput));
        }
    }

}
export { IsoRfcToEpochCommand };
