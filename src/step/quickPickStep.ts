'use strict';

import { Disposable, QuickInputButton, QuickInputButtons, QuickPick, QuickPickItem, window } from 'vscode';
import { InputFlowAction } from '../util/InputFlowAction';
import { IStep } from './IStep';
import { MultiStepHandler } from './multiStepHandler';
import { StepResult } from './stepResult';

/**
 * the QuickPickStep. Used to show the user a quick pick form.
 */
class QuickPickStep implements IStep {

    /**
     * Indicates whether this step is skipped when the user's pre-selection is valid.
     */
    private _skip: boolean;

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
        alternativeStep?: IStep,
        skip: boolean = false) {

        this._quickPick = window.createQuickPick();
        this._quickPick.placeholder = placeholder;
        this._quickPick.title = title;
        this._quickPick.matchOnDescription = true;
        this._quickPick.matchOnDetail = true;

        this._items = items;

        this._allowOtherItem = allowOtherItem;
        this._alternativeStep = alternativeStep;

        this._skip = skip;
        this._disposables.push(this._quickPick);
    }

    /**
     * Execute this step.
     * @param handler The handler of the step.
     * @param step The step's number.
     * @param totalSteps The amount of overall steps.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     */
    public execute(
        handler: MultiStepHandler,
        step: number,
        totalSteps: number,
        ignoreFocusOut: boolean): Thenable<StepResult> {

        this._quickPick.step = step;
        this._quickPick.totalSteps = totalSteps;
        this._quickPick.ignoreFocusOut = ignoreFocusOut;
        this._quickPick.items = this._allowOtherItem ? [...this._items, this._allowOtherItem] : this._items;
        this._quickPick.selectedItems = [this._items[0]];
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
     * Gets skip, indicating whether this step shall be skipped when the user selection is valid.
     */
    public get skip(): boolean {
        return this._skip;
    }

    /**
     * Gets the validation function used for this step.
     */
    public get validation(): (input: string, ...args: string[]) => boolean {
        return () => true;
    }

    /**
     * Dispose this object.
     */
    public dispose() {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

}

export { QuickPickStep };
