import BaseController from "./BaseController";

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
    }

    _onRouteMatched(oEvent) {
        const oUrlParams = oEvent.getParameter("arguments");
        // this.getView().bindElement({
        //     path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").invoicePath),
        //     model: "invoice"
        // });
    }

    onNavigate(oEvent) {
        this.getOwnerComponent().getRouter()?.navTo("Main");
    }
}
