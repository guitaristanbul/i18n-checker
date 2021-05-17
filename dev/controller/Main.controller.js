import BaseController from "./BaseController";
import models from "devepos/i18ncheck/model/models";
import CheckI18nService from "devepos/i18ncheck/model/dataAccess/rest/CheckI18nService";
import Token from "sap/m/Token";
import ValueState from "sap/ui/core/ValueState";

/**
 * Main View Controller
 *
 * @extends devepos.i18ncheck.controller.BaseController
 * @alias devepos.i18ncheck.controller.Main
 * @public
 */
export default class MainController extends BaseController {
    onInit() {
        BaseController.prototype.onInit.call(this);
        this._oPage = this.byId("page");
        if (!document.querySelector(".sapUshellShell")) {
            this._oPage.setTitle(this.getOwnerComponent().getResourceBundle().getText("mainPageTitle"));
        }
        this._oViewModel = models.createViewModel({
            compareAgainstDefault: true,
            defaultLanguage: "en"
        });
        this.getView().setModel(this._oViewModel, "viewModel");
    }

    onChange(oEvent) {
        const oInput = oEvent.getSource();
        if (oInput?.getRequired()) {
            this._checkRequired(oInput);
        }
    }

    onMultiSubmit(oEvent) {
        this._addTargetLanguage(oEvent.getSource(), oEvent.getParameter("value"));
    }

    onMultiChange(oEvent) {
        this._addTargetLanguage(oEvent?.getSource(), oEvent?.getParameter("value"));
        this.onChange(oEvent);
    }

    onExecuteCheck(oEvent) {
        this._oPage.setBusy(true);
        if (!this._validateFields()) {
            this._oPage.setBusy(false);
            return;
        }
        setTimeout(() => {
            this._oPage.setBusy(false);
            this.getOwnerComponent()
                .getRouter()
                ?.navTo("CheckResults", { defLang: "en", trgtLang: "en", bspName: encodeURIComponent("/DUI/*") });
        }, 2000);
    }

    _addTargetLanguage(oInput, sValue) {
        if (!oInput || !oInput?.isA("sap.m.MultiInput") || !sValue) {
            return;
        }
        if (oInput.data()?.hasOwnProperty("upperCase")) {
            if (oInput.data().upperCase && sValue?.toUpperCase) {
                sValue = sValue.toUpperCase();
            }
        }
        // check if token was already added
        const aTokens = oInput.getTokens();
        if (aTokens.filter(oToken => oToken.getKey() === sValue).length <= 0) {
            oInput.addToken(new Token({ key: sValue, text: sValue }));
            oInput.setValue("");
        }
    }

    _checkRequired(oInputCtrl) {
        if (oInputCtrl.isA("sap.m.MultiInput")) {
            const aTokens = oInputCtrl.getTokens();
            oInputCtrl.setValueState(!aTokens || aTokens.length <= 0 ? ValueState.Error : ValueState.None);
        } else if (oInputCtrl.isA("sap.m.Input")) {
            oInputCtrl.setValueState(!oInputCtrl.getValue() ? ValueState.Error : ValueState.None);
        }
    }

    _validateFields() {
        const aRequired = this.getView().getControlsByFieldGroupId("requiredParam");
        for (const oRequiredCtrl of aRequired) {
            if (!oRequiredCtrl.getRequired) {
                continue;
            }
            this._checkRequired(oRequiredCtrl);
            if (oRequiredCtrl?.getRequired() && oRequiredCtrl?.getValueState() === ValueState.Error) {
                oRequiredCtrl.focus();
                return false;
            }
        }
        return true;
    }
}
