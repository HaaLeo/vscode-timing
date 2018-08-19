'use strict';

import { Disposable, QuickInputButton, QuickInputButtons, QuickPick, QuickPickItem, window } from 'vscode';
import { InputFlowAction } from './InputFlowAction';
import { IStep } from './IStep';
import { MultiStepHandler } from './MultiStepHandler';
import { StepResult } from './StepResult';

/**
 * the QuickPickStep. Used to show the user a quick pick form.
 */
class QuickPickStep implements IStep {

    /**
     * The quick-pick that is shown to the user.
     */
    private _quickPick: QuickPick<QuickPickItem>;

    /**
     * The disposables.
     */
    private _disposables: Disposable[] = [];

    /**
     * The alternative step that can be executed instead of this one.
     */
    private _alternativeStep: IStep;

    /**
     * The item that triggers the `_alternativeStep` when it is selected by the user.
     */
    private _allowOtherItem: QuickPickItem;

    /**
     * The items the user can select of.
     */
    private _items: QuickPickItem[];

    /**
     * Creates a `QuickPickStep`.
     * @param placeholder The quick-pick's placeholder.
     * @param title The quick-pick's title.
     * @param items The items to show the user.
     * @param allowOtherItem The item that triggers the `alternativeStep` when it is selected.
     * @param alternativeStep The alternative step to execute instead of this one.
     */
    public constructor(
        placeholder: string,
        title: string,
        items: QuickPickItem[],
        allowOtherItem?: QuickPickItem,
        alternativeStep?: IStep) {

        this._quickPick = window.createQuickPick();
        this._quickPick.placeholder = placeholder;
        this._quickPick.title = title;
        this._quickPick.ignoreFocusOut = true;
        this._quickPick.matchOnDescription = true;
        this._quickPick.matchOnDetail = true;

        this._items = items;

        this._allowOtherItem = allowOtherItem;

        this._alternativeStep = alternativeStep;
        this._disposables.push(this._quickPick);
    }

    /**
     * Execute this step.
     * @param handler The handler of the step.
     * @param step The step's number.
     * @param totalSteps The amount of overall steps.
     */
    public execute(handler: MultiStepHandler, step: number, totalSteps: number): Thenable<StepResult> {
        this._quickPick.step = step;
        this._quickPick.totalSteps = totalSteps;
        this._quickPick.items = this._allowOtherItem ? [...this._items, this._allowOtherItem] : this._items;
        if (step > 1) {
            this._quickPick.buttons = [QuickInputButtons.Back];
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

    /**
     * Dispose this object.
     */
    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

}

export { QuickPickStep };
