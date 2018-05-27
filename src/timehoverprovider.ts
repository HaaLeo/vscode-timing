'use strict';

import * as vscode from 'vscode'
import TimeConverter = require('./timeconverter')
class TimeHoverProvider implements vscode.HoverProvider {

    _timeConverter: TimeConverter

    constructor(timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;
    }

    public provideHover(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        vscode.ProviderResult<vscode.Hover> {
            let timeRange = document.getWordRangeAtPosition(position, new RegExp('\\d+'))
            let result: vscode.Hover = undefined;
            if (timeRange !== undefined) {
                let hoveredWord = document.getText(timeRange)
                let utc = this._timeConverter.convertToISO(Number(hoveredWord)) //TODO: check unit.
                result = new vscode.Hover('# UTC\n' + utc, timeRange)
            }

            return result
    }
}

export = TimeHoverProvider
