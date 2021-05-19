import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";

/**
 * @alias devepos.i18ncheck.model.util.AsyncDialog
 */
export default class AsyncDialog {
    static OK_BUTTON = "ok";
    static CANCEL_BUTTON = "cancel";
    constructor(mParams) {
        this._sTitle = mParams?.title || "Dialog";
        this._sWidth = mParams?.width || "50%";
        this._sHeight = mParams?.height || "50%";
        this._createButtons(mParams?.buttons);
        this._aContent = mParams?.content;
        this._oModel = mParams?.model;
    }
    async showDialog(oDependent) {
        return new Promise(fnResolve => {
            this._oDependent = oDependent;
            this._oDialog = new Dialog({
                contentHeight: this._sHeight,
                contentWidth: this._sWidth,
                draggable: true,
                content: this._aContent,
                title: this._sTitle,
                buttons: this._aButtons,
                afterClose: oEvt => {
                    fnResolve(this._sCloseButton);
                    this._oDependent?.removeDependent(this._oDialog);
                    this._oDialog.destroy();
                }
            });
            oDependent?.addDependent(this._oDialog);
            if (this._oModel) {
                this._oDialog.setModel(this._oModel);
            }
            this._oDialog.open();
        });
    }
    _createButtons(aButtons) {
        if (aButtons) {
            this._aButtons = [];
            aButtons.forEach(mButtonConfig => {
                if (!!mButtonConfig.text && !mButtonConfig.icon) {
                    return;
                }
                this._aButtons.push(
                    new Button({
                        text: mButtonConfig.text,
                        icon: mButtonConfig.icon,
                        type: mButtonConfig.type || sap.m.ButtonType.Default,
                        press: () => {
                            this._sCloseButton = mButtonConfig.key || mButtonConfig.text;
                            this._oDialog?.close();
                        }
                    })
                );
            });
        }
        if (!this._aButtons) {
            this._aButtons = [
                new Button({
                    text: "{i18n>ok}",
                    press: () => {
                        this._sCloseButton = "ok";
                        this._oDialog?.close();
                    }
                }),
                new Button({
                    text: "{i18n>cancel}",
                    press: () => {
                        this._sCloseButton = "cancel";
                        this._oDialog?.close();
                    }
                })
            ];
        }
    }
}
