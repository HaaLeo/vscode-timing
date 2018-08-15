'use strict';

import { Disposable, QuickInputButton, QuickInputButtons, QuickPick, QuickPickItem, window } from 'vscode';
import { InputFlowAction } from './InputFlowAction';
import { IStep } from './IStep';
import { StepResult } from './StepResult';

class QuickPickStep implements IStep {

    private _buttons: QuickInputButton[];
    private _quickPick: QuickPick<QuickPickItem>;
    private _disposables: Disposable[] = [];
    private _getOtherItemStep: IStep;
    private _allowOtherItem: QuickPickItem;
    private _items: QuickPickItem[];

    public constructor(
        placeholder: string,
        title: string,
        buttons: QuickInputButton[],
        items: QuickPickItem[],
        allowOtherItem?: QuickPickItem,
        getOtherItemStep?: IStep) {

        this._quickPick = window.createQuickPick();
        this._quickPick.placeholder = placeholder;
        this._quickPick.title = title;
        this._quickPick.ignoreFocusOut = true;
        this._quickPick.matchOnDescription = true;
        this._quickPick.matchOnDetail = true;

        this._buttons = buttons;
        this._items = items;

        this._allowOtherItem = allowOtherItem;
        this._getOtherItemStep = getOtherItemStep;

        this._disposables.push(this._quickPick);
    }

    public execute(step: number, totalSteps: number): Promise<StepResult> {
        this._quickPick.step = step;
        this._quickPick.totalSteps = totalSteps;
        this._quickPick.items = this._items;
        if (step > 1) {
            this._quickPick.buttons = [QuickInputButtons.Back, ...this._buttons];
        } else {
            this._quickPick.buttons = this._buttons;
        }
        return new Promise<StepResult>((resolve, reject) => {

            this._quickPick.onDidAccept(async () => {
                const picked = this._quickPick.selectedItems[0].label;
                if (this._allowOtherItem && (picked === this._allowOtherItem.label)) {
                    let result = await this._getOtherItemStep.execute(step + 1, totalSteps + 1);
                    if (result.action === InputFlowAction.Back) {
                        result = await this.execute(step + 1, totalSteps + 1);
                    }
                    resolve(result);
                } else {
                    resolve(new StepResult(InputFlowAction.Continue, picked, step + 1, totalSteps));
                }
                this._quickPick.hide();

            });

            this._quickPick.onDidTriggerButton((button) => {
                if (button === QuickInputButtons.Back) {
                    resolve(new StepResult(

                            InputFlowAction.Back, undefined, step - 1, totalSteps));
                    this._quickPick.hide();
                }
            });

            this._quickPick.onDidHide(() => {
                resolve(new StepResult(InputFlowAction.Cancel, undefined, 0, totalSteps));
            });

            this._quickPick.show();
        });
    }

    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

}

export { QuickPickStep };
