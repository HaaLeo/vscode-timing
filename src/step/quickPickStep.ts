/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import { Disposable, QuickInputButtons, QuickPick, QuickPickItem, window } from 'vscode';
import { InputFlowAction } from '../util/inputFlowAction';
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
     * The selected item of the current call. Saved to display again initially until command was exited.
     */
    private _preSelectedItem: QuickPickItem;

    /**
     * Indicates whether the `_items` are custom formats that have to be updated.
     */
    private _usesCustomFormats: boolean;

    /**
     * Creates a `QuickPickStep`.
     * @param placeholder The quick-pick's placeholder.
     * @param title The quick-pick's title.
     * @param items The items to show the user.
     * @param allowOtherItem The item that triggers the `alternativeStep` when it is selected.
     * @param alternativeStep The alternative step to execute instead of this one.
     * @param skip Indicates whether this step shall be skipped if user selection is valid.
     * @param usesCustomFormats Indicates whether this step uses custom formats, that have to be updated.
     */
    public constructor(
        placeholder: string,
        title: string,
        items: QuickPickItem[],
        allowOtherItem?: QuickPickItem,
        alternativeStep?: IStep,
        skip: boolean = false,
        usesCustomFormats: boolean = true) {

        this._quickPick = window.createQuickPick();
        this._quickPick.placeholder = placeholder;
        this._quickPick.title = title;
        this._quickPick.matchOnDescription = true;
        this._quickPick.matchOnDetail = true;

        this._items = items;

        this._allowOtherItem = allowOtherItem;
        this._alternativeStep = alternativeStep;

        this._skip = skip;
        this._usesCustomFormats = usesCustomFormats;
        this._disposables.push(this._quickPick);
    }

    /**
     * Execute this step.
     * @param handler The handler of the step.
     * @param stepIndex The step's index to show.
     * @param totalSteps The amount of overall steps.
     * @param ignoreFocusOut Indicates whether the form stays visible when focus is lost
     */
    public execute(
        handler: MultiStepHandler,
        stepIndex: number,
        totalSteps: number,
        ignoreFocusOut: boolean): Thenable<StepResult> {

        this._quickPick.value = '';
        this._quickPick.step = stepIndex;
        this._quickPick.totalSteps = totalSteps;
        this._quickPick.ignoreFocusOut = ignoreFocusOut;
        this._quickPick.items = this._allowOtherItem ? [...this._items, this._allowOtherItem] : this._items;
        this._quickPick.selectedItems = [];
        if (stepIndex > 1) {
            this._quickPick.buttons = [QuickInputButtons.Back];
        }

        // Display chosen item (if for instance back was triggered.)
        this._quickPick.activeItems = [this._preSelectedItem];

        // The alternative step could still be registered from previous command call
        handler.unregisterStep(this._alternativeStep);

        return new Promise<StepResult>(resolve => {

            this._quickPick.onDidAccept(() => {
                if (this._quickPick.selectedItems.length === 1) {
                    let resultValue: string;
                    const picked = this._quickPick.selectedItems[0];
                    if (this._allowOtherItem && (picked.label === this._allowOtherItem.label)) {
                        handler.registerStep(this._alternativeStep, handler.indexOf(this) + 1);
                        resultValue = undefined;
                        this._preSelectedItem = this._allowOtherItem;
                    } else {
                        resultValue = picked.label;
                        this._preSelectedItem = picked;
                    }
                    this._quickPick.hide();
                    resolve(new StepResult(InputFlowAction.Continue, resultValue));
                }
            });

            this._quickPick.onDidTriggerButton(button => {
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
     * Indicates whether this step is uses custom formats as items.
     */
    public get usesCustomFormats(): boolean {
        return this._usesCustomFormats;
    }

    /**
     * Set the possible items the user can pick of.
     */
    public set items(items: QuickPickItem[]) {
        this._items = items;
    }

    /**
     * Gets the validation function used for this step.
     */
    public get validation(): (input: string, ...args: string[]) => boolean {
        return (): boolean => true;
    }

    /**
     * Reset the pre-selection of this step.
     */
    public reset(): void {
        this._quickPick.value = '';
        this._quickPick.items = this._items;
        this._preSelectedItem = this._quickPick.items[0];

        if (this._alternativeStep) {
            this._alternativeStep.reset();
        }
    }

    /**
     * Dispose this object.
     */
    public dispose(): void {
        this._disposables.forEach(disposable => disposable.dispose());
    }

}

export { QuickPickStep };
