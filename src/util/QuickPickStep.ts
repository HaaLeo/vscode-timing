'use strict';

import { Disposable, QuickInputButton, QuickInputButtons, QuickPick, QuickPickItem, window } from 'vscode';
import { InputFlowAction } from './InputFlowAction';
import { IStep } from './IStep';
import { MultiStepHandler } from './MultiStepHandler';
import { StepResult } from './StepResult';

class QuickPickStep implements IStep {

    private _buttons: QuickInputButton[];
    private _quickPick: QuickPick<QuickPickItem>;
    private _disposables: Disposable[] = [];
    private _alternativeStep: IStep;
    private _allowOtherItem: QuickPickItem;
    private _items: QuickPickItem[];

    public constructor(
        placeholder: string,
        title: string,
        buttons: QuickInputButton[],
        items: QuickPickItem[],
        allowOtherItem?: QuickPickItem,
        alternativeStep?: IStep) {

        this._quickPick = window.createQuickPick();
        this._quickPick.placeholder = placeholder;
        this._quickPick.title = title;
        this._quickPick.ignoreFocusOut = true;
        this._quickPick.matchOnDescription = true;
        this._quickPick.matchOnDetail = true;

        this._buttons = buttons;
        this._items = items;

        // When this item is selected the _alternativeStep will be invoked.
        this._allowOtherItem = allowOtherItem;

        this._alternativeStep = alternativeStep;
        this._disposables.push(this._quickPick);
    }

    public execute(handler: MultiStepHandler, step: number, totalSteps: number): Thenable<StepResult> {
        this._quickPick.step = step;
        this._quickPick.totalSteps = totalSteps;
        this._quickPick.items = this._allowOtherItem ? [...this._items, this._allowOtherItem] : this._items;
        if (step > 1) {
            this._quickPick.buttons = [QuickInputButtons.Back, ...this._buttons];
        } else {
            this._quickPick.buttons = this._buttons;
        }
        return new Promise<StepResult>((resolve, reject) => {

            this._quickPick.onDidAccept(() => {
                if (this._quickPick.selectedItems.length === 1) {
                    let resultValue: string;
                    const picked = this._quickPick.selectedItems[0].label;
                    if (this._allowOtherItem && (picked === this._allowOtherItem.label)) {
                        handler.registerStep(this._alternativeStep, step);
                        resultValue = undefined;
                    } else {
                        resultValue = picked;
                    }
                    this._quickPick.hide();
                    resolve(new StepResult(InputFlowAction.Continue, resultValue));
                }
            });

            this._quickPick.onDidTriggerButton((button) => {
                if (button === QuickInputButtons.Back) {
                    this._quickPick.hide();
                    resolve(new StepResult(InputFlowAction.Back, undefined));
                }
            });

            this._quickPick.onDidHide(() => {
                resolve(new StepResult(InputFlowAction.Cancel, undefined));
            });

            this._quickPick.show();
        });
    }

    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

}

export { QuickPickStep };
