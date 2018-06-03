'use strict';

import * as vscode from 'vscode';
import InputDefinition = require('./inputdefinition');
import TimeConverter = require('./timeconverter');

class TimeHoverProvider implements vscode.HoverProvider {

    private _timeConverter: TimeConverter;

    constructor(timeConverter: TimeConverter) {
        this._timeConverter = timeConverter;
    }

    public provideHover(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        vscode.ProviderResult<vscode.Hover> {
        const timeRange = document.getWordRangeAtPosition(position, new RegExp('\\d+'));
        let result: vscode.Hover;
        if (timeRange !== undefined) {
            const hoveredTime = new InputDefinition(document.getText(timeRange));
            const utc = this._timeConverter.epochToIsoUtc(hoveredTime.inputAsMs);
            result = new vscode.Hover(
                '*Epoch Unit*: `' + hoveredTime.originalUnit + '`  \n*UTC*: `' + utc + '`',
                timeRange);
        }

        return result;
    }
}

export = TimeHoverProvider;
