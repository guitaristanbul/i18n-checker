import BaseController from "./BaseController";
import models from "devepos/i18ncheck/model/models";
import Token from "sap/m/Token";
import ValueState from "sap/ui/core/ValueState";
import constants from "devepos/i18ncheck/model/constants";

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

        this._oTargetLanguagesInput = this.getView().byId("trgtLanguagesInput");
        this._oBspNameFilterInput = this.getView().byId("bspNameFilter");
        this.getView()
            .byId("paramsPanel")
            .attachBrowserEvent(
                "keyup",
                oEvent => {
                    if (oEvent.key === "Enter" && oEvent.ctrlKey && !oEvent.metaKey && !oEvent.shiftKey) {
                        this.onExecuteCheck();
                    }
                },
                this
            );
    }

    onChange(oEvent) {
        const oInput = oEvent.getSource();
        if (oInput.isA("sap.m.MultiInput")) {
            this._addTokensToMultiInput(oInput, oEvent?.getParameter("value"));
        }
        if (oInput?.getRequired()) {
            this._checkRequired(oInput);
        }
    }

    onSubmit(oEvent) {
        const oInput = oEvent.getSource();
        if (oInput.isA("sap.m.MultiInput")) {
            this._addTokensToMultiInput(oInput, oEvent.getParameter("value"));
        }
    }

    onExecuteCheck() {
        if (!this._validateFields()) {
            return;
        }
        this.getOwnerComponent()
            .getRouter()
            ?.navTo("CheckResults", {
                [constants.navParams.checkResultsPage.DEFAULT_LANGUAGE]:
                    this._oViewModel.getProperty("/defaultLanguage"),
                [constants.navParams.checkResultsPage.COMPARE_AGAINST_DEFAULT_FILE]:
                    this._oViewModel.getProperty("/compareAgainstDefault"),
                [constants.navParams.checkResultsPage.TARGET_LANGUAGE]: this._oTargetLanguagesInput
                    .getTokens()
                    .map(oToken => oToken.getKey())
                    .join(","),
                [constants.navParams.checkResultsPage.BSP_NAME]: this._oBspNameFilterInput
                    .getTokens()
                    .map(oToken => encodeURIComponent(oToken.getKey()))
                    .join(",")
            });

        // this._oPage.setBusy(true);
        // if (!this._validateFields()) {
        //     this._oPage.setBusy(false);
        //     return;
        // }
        // const oCheckService = new CheckI18nService();
        // const mParams = {
        //     defaultLanguage: this._oViewModel.getProperty("/defaultLanguage"),
        //     compareAgainstDefaultFile: this._oViewModel.getProperty("/compareAgainstDefault"),
        //     bspNames: this._oBspNameFilterInput.getTokens().map(oToken => oToken.getKey()),
        //     targetLanguages: this._oTargetLanguagesInput.getTokens().map(oToken => oToken.getKey())
        // };
        // try {
        //     const oCheckResults = await oCheckService.checkTranslations(mParams);
        //     this._oPage.setBusy(false);
        //     this.getOwnerComponent()
        //         .getRouter()
        //         ?.navTo("CheckResults", {
        //             [constants.navParams.checkResultsPage.DEFAULT_LANGUAGE]: mParams.defaultLanguage,
        //             [constants.navParams.checkResultsPage.COMPARE_AGAINST_DEFAULT_FILE]: mParams.compareAgainstDefaultFile,
        //             [constants.navParams.checkResultsPage.TARGET_LANGUAGE]: mParams,
        //             [constants.navParams.checkResultsPage.BSP_NAME]: encodeURIComponent("/DUI/*")
        //         });
        // } catch (oError) {
        //     this._oPage.setBusy(false);
        //     Log.error(oError);
        // }
    }

    _addTokensToMultiInput(oInput, sValue) {
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
        let bSetValueState = false;
        let sValueState = "";

        if (oInputCtrl.isA("sap.m.MultiInput")) {
            const aTokens = oInputCtrl.getTokens();
            bSetValueState = true;
            sValueState = !aTokens || aTokens.length <= 0 ? ValueState.Error : ValueState.None;
            oInputCtrl.setValueState();
        } else if (oInputCtrl.isA("sap.m.Input")) {
            bSetValueState = true;
            sValueState = !oInputCtrl.getValue() ? ValueState.Error : ValueState.None;
        }

        if (bSetValueState) {
            oInputCtrl.setValueState(sValueState);
            if (sValueState === ValueState.Error) {
                oInputCtrl.setValueStateText(
                    this.getOwnerComponent().getResourceBundle().getText("mandatoryFieldNotFilled")
                );
            } else {
                oInputCtrl.setValueStateText("");
            }
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
                setTimeout(() => {
                    oRequiredCtrl.focus();
                }, 100);
                return false;
            }
        }
        return true;
    }
}
