import BaseController from "devepos/i18ncheck/controller/BaseController";
import Log from "sap/base/Log";

/**
 * @alias devepos.i18ncheck.controller.CheckDetails
 */
export default class CheckDetailsController extends BaseController {
    onInit() {
        BaseController.prototype.onInit.call(this);
        this._oPage = this.getView().byId("detailsPage");
        this.getRouter().getRoute("CheckDetails").attachPatternMatched(this._onRouteMatched, this);
    }

    async _onRouteMatched(oEvent) {
        // check if the results model is filled, if so nothing has to be done
        const aCheckResults = this.getOwnerComponent().getModel().getProperty("/results");
        if (!aCheckResults || !Array.isArray(aCheckResults) || aCheckResults.length === 0) {
            this.getRouter().navTo("Main");
        }
        const oUrlParams = oEvent.getParameter("arguments");
        if (!oUrlParams.hasOwnProperty("?query")) {
            Log.error("'?query' was not supplied to route");
            window.go(-1);
            return;
        }
        const sBindingPath = decodeURIComponent(oUrlParams["?query"].path);

        this.getView().bindElement({
            path: sBindingPath,
            events: {
                change: () => {
                    if (!this.getView().getBindingContext()) {
                        this.getRouter().navTo("Main");
                    }
                }
            }
        });
    }
}
