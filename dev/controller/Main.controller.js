import BaseController from "./BaseController";
import models from "devepos/i18ncheck/model/models";
import CheckI18nService from "devepos/i18ncheck/model/dataAccess/rest/CheckI18nService";
import formatter from "devepos/i18ncheck/model/formatter";
import Token from "sap/m/Token";
import ValueState from "sap/ui/core/ValueState";
import Log from "sap/base/Log";
import Filter from "sap/ui/model/Filter";
import MessageToast from "sap/m/MessageToast";

/**
 * Main View Controller
 *
 * @extends devepos.i18ncheck.controller.BaseController
 * @alias devepos.i18ncheck.controller.Main
 * @public
 */
export default class MainController extends BaseController {
    formatter = formatter;
    onInit() {
        BaseController.prototype.onInit.call(this);
        this._oPage = this.byId("page");
        this._oBundle = this.getOwnerComponent().getResourceBundle();
        this._oModel = this.getOwnerComponent().getModel();
        this._oViewModel = models.createViewModel({
            compareAgainstDefault: true,
            showExcludedEntries: false,
            defaultLanguage: "en",
            selectedFilter: "Error",
            resultsTableTitle: this._oBundle.getText("resultsTableTitle", [0])
        });
        this.getView().setModel(this._oViewModel, "viewModel");
        this._oModel.setData({ count: 0, withoutErrorsCount: 0, withErrorsCount: 0 });
        this._oTargetLanguagesInput = this.getView().byId("trgtLanguagesInput");
        this._oBspNameFilterInput = this.getView().byId("bspNameFilter");
    }

    onUpdateFinished() {
        let iCount = 0;
        switch (this._oViewModel.getProperty("/selectedFilter")) {
            case "Error":
                iCount = this._oModel.getProperty("/withErrorsCount");
                break;
            case "Ok":
                iCount = this._oModel.getProperty("/withoutErrorsCount");
                break;
            case "All":
                iCount = this._oModel.getProperty("/count");
                break;
            default:
                break;
        }
        this._oViewModel.setProperty("/resultsTableTitle", this._oBundle.getText("resultsTableTitle", [iCount]));
    }

    onResultsPress(oEvent) {
        const oNextUIState = this.getFlexColHelper().getNextUIState(1);
        this.oRouter.navTo("detail", {
            layout: oNextUIState.layout,
            resultPath: encodeURIComponent(oEvent.getSource().getBindingContextPath())
        });
    }

    onChange(oEvent) {
        const oInput = oEvent.getSource();
        oInput.data("__changing", true);
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
            if (oInput.data("__changing")) {
                oInput.data("__changing", false);
                return;
            }
        }
        this.onSearch();
    }

    async onSearch() {
        if (!this._validateFields()) {
            return;
        }
        // this.getOwnerComponent().getModel().setData();
        // check if the results model is filled, if so nothing has to be done
        this._oViewModel.setProperty("/busy", true);

        const oModelData = this._oViewModel.getData();
        const mParams = {
            defaultLanguage: oModelData.defaultLanguage,
            compareAgainstDefaultFile: oModelData.compareAgainstDefault,
            targetLanguages: this._oTargetLanguagesInput
                .getTokens()
                .map(oToken => oToken.getKey())
                .join(","),
            bspNames: this._oBspNameFilterInput
                .getTokens()
                .map(oToken => encodeURIComponent(oToken.getKey()))
                .join(","),
            showExcludedEntries: oModelData.showExcludedEntries
        };

        let aCheckResults = [];
        let iWithErrorsCount = 0;
        let iWithoutErrorsCount = 0;
        try {
            const oCheckService = new CheckI18nService();
            const oResponse = await oCheckService.checkTranslations(mParams);
            aCheckResults = oResponse.data;
            for (const oCheckResult of aCheckResults) {
                switch (oCheckResult.status) {
                    case "S":
                    case "W":
                        iWithoutErrorsCount++;
                        break;
                    case "E":
                        iWithErrorsCount++;
                        break;
                    default:
                        break;
                }
            }
            if (!aCheckResults || aCheckResults.length === 0) {
                MessageToast.show(this._oBundle.getText("noDataFoundMessage"));
            }
        } catch (oError) {
            const sErrorMessage = oError.statusText
                ? oError.statusText
                : "Error during calling the 'check i18n translations' service";
            Log.error(sErrorMessage);
            MessageToast.show(sErrorMessage);
        }
        this._oModel.setData({
            results: aCheckResults,
            count: aCheckResults.length,
            withoutErrorsCount: iWithoutErrorsCount,
            withErrorsCount: iWithErrorsCount
        });
        this._oViewModel.setProperty("/busy", false);
        this.onFilterChange();
    }

    onFilterChange(oEvent) {
        const oBinding = this.byId("checkResults").getBinding("items");
        const sFilterKey = this._oViewModel.getProperty("/selectedFilter");
        // Array to combine filters
        const aFilters = [];
        let oStatusFilter;

        if (sFilterKey === "Ok") {
            oStatusFilter = new Filter("status", "NE", "E");
        } else if (sFilterKey === "Error") {
            oStatusFilter = new Filter("status", "EQ", "E");
        }
        if (oStatusFilter) {
            aFilters.push(oStatusFilter);
        }
        oBinding.filter(aFilters);
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
