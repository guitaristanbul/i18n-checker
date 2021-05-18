import BaseController from "./BaseController";
import Log from "sap/base/Log";
import CheckI18nService from "devepos/i18ncheck/model/dataAccess/rest/CheckI18nService";
import constants from "devepos/i18ncheck/model/constants";
import models from "devepos/i18ncheck/model/models";
import Filter from "sap/ui/model/Filter";

/**
 * CheckResults View Controller
 *
 * @extends devepos.i18ncheck.controller.BaseController
 * @alias devepos.i18ncheck.controller.CheckResults
 * @public
 */
export default class CheckResultsController extends BaseController {
    onInit() {
        BaseController.prototype.onInit.call(this);
        this._oPage = this.byId("resultsPage");
        if (!document.querySelector(".sapUshellShell")) {
            this._oPage.setShowNavButton(true);
        }
        this._oViewModel = models.createViewModel({ busy: false, selectedFilter: "All" });
        this.getView().setModel(this._oViewModel, "viewModel");
        this.getRouter().getRoute("CheckResults").attachPatternMatched(this._onRouteMatched, this);
    }

    onNavigate(oEvent) {
        this.getRouter()?.navTo("Main");
    }

    onResultsPress(oEvent) {
        // const oSelectedBsp = this.getOwnerComponent()
        //     .getModel()
        //     ?.getObject(oEvent.getSource()?.getBindingContextPath());
        // if (!oSelectedBsp) {
        //     return;
        // }
        const sBindingPath = oEvent.getSource()?.getBindingContextPath();
        if (!sBindingPath) {
            return;
        }
        this.getOwnerComponent()
            .getRouter()
            .navTo("CheckDetails", {
                path: encodeURIComponent(sBindingPath)
            });
    }

    onFilterSelect(oEvent) {
        const oBinding = this.byId("checkResults").getBinding("items");
        const sKey = oEvent.getParameter("key");
        // Array to combine filters
        const aFilters = [];
        let oStatusFilter;

        if (sKey === "Ok") {
            oStatusFilter = new Filter("status", "NE", "E");
        } else if (sKey === "Error") {
            oStatusFilter = new Filter("status", "EQ", "E");
        }
        if (oStatusFilter) {
            aFilters.push(oStatusFilter);
        }
        oBinding.filter(aFilters);
    }

    async _onRouteMatched(oEvent) {
        // check if the results model is filled, if so nothing has to be done
        let aCheckResults = this.getOwnerComponent().getModel().getProperty("/results");
        if (aCheckResults && Array.isArray(aCheckResults) && aCheckResults.length > 0) {
            return;
        }
        this._oViewModel.setProperty("/busy", true);

        const oUrlParams = oEvent.getParameter("arguments");
        if (!oUrlParams) {
            Log.error("'Query parameters' were not supplied to route");
            return;
        }
        const mParams = {
            defaultLanguage: oUrlParams[constants.navParams.checkResultsPage.DEFAULT_LANGUAGE],
            compareAgainstDefaultFile: oUrlParams[constants.navParams.checkResultsPage.COMPARE_AGAINST_DEFAULT_FILE],
            bspNames: oUrlParams[constants.navParams.checkResultsPage.BSP_NAME],
            targetLanguages: oUrlParams[constants.navParams.checkResultsPage.TARGET_LANGUAGE]
        };

        aCheckResults = [];
        let iWithErrorsCount = 0;
        let iWithoutErrorsCount = 0;
        try {
            const oCheckService = new CheckI18nService();
            const { data: sCheckResult } = await oCheckService.checkTranslations(mParams);
            aCheckResults = JSON.parse(sCheckResult);
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
        } catch (oError) {
            Log.error(oError);
        }
        this.getOwnerComponent().getModel().setData({
            results: aCheckResults,
            count: aCheckResults.length,
            withoutErrorsCount: iWithoutErrorsCount,
            withErrorsCount: iWithErrorsCount
        });
        this._oViewModel.setProperty("/busy", false);
        const oBinding = this.byId("checkResults").getBinding("items");
        oBinding.filter([new Filter("status", "EQ", "E")]);
        this._oViewModel.setProperty("/selectedFilter", "Error");
    }
}
