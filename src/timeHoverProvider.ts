'use strict';

import * as vscode from 'vscode';
import { InputDefinition } from './inputDefinition';
import { TimeConverter } from './timeConverter';

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
            const hoveredWord = document.getText(timeRange);
            if (this._timeConverter.isValidEpoch(hoveredWord)) {
                const input = new InputDefinition(hoveredWord);
                const utc = this._timeConverter.epochToIsoUtc(input.inputAsMs.toString());
                result = new vscode.Hover(
                    '*Epoch Unit*: `' + input.originalUnit + '`  \n*UTC*: `' + utc + '`',
                    timeRange);
            }
        }

        return result;
    }
}

export { TimeHoverProvider };
