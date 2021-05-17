import BaseController from "./BaseController";
import Log from "sap/base/Log";
import CheckI18nService from "devepos/i18ncheck/model/dataAccess/rest/CheckI18nService";
import constants from "devepos/i18ncheck/model/constants";
import models from "devepos/i18ncheck/model/models";

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
            this._oPage.setTitle(this.getOwnerComponent().getResourceBundle().getText("resultPageTitle"));
            this._oPage.setShowNavButton(true);
        }
        this.getOwnerComponent().getRouter().getRoute("CheckResults").attachPatternMatched(this._onRouteMatched, this);
        this._oViewModel = models.createViewModel({ busy: false });
        this.getView().setModel(this._oViewModel, "viewModel");
    }

    async _onRouteMatched(oEvent) {
        this._oViewModel.setProperty("/busy", true);

        const oUrlParams = oEvent.getParameter("arguments");
        const mParams = {
            defaultLanguage: oUrlParams[constants.navParams.checkResultsPage.DEFAULT_LANGUAGE],
            compareAgainstDefaultFile: oUrlParams[constants.navParams.checkResultsPage.COMPARE_AGAINST_DEFAULT_FILE],
            bspNames: oUrlParams[constants.navParams.checkResultsPage.BSP_NAME],
            targetLanguages: oUrlParams[constants.navParams.checkResultsPage.TARGET_LANGUAGE]
        };
        try {
            const oCheckService = new CheckI18nService();
            const oCheckResult = await oCheckService.checkTranslations(mParams);
            console.log(oCheckResult);
        } catch (oError) {
            Log.error(oError);
        }
        this._oViewModel.setProperty("/busy", false);
    }

    onNavigate(oEvent) {
        this.getOwnerComponent().getRouter()?.navTo("Main");
    }
}
