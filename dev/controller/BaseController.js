import Controller from "sap/ui/core/mvc/Controller";

/**
 * Main View Controller
 *
 * @extends sap.ui.core.mvc.Controller
 * @alias devepos.i18ncheck.controller.BaseController
 * @public
 */
export default class BaseController extends Controller {
    onInit() {}

    /**
     * Retrieves the configurated router instance
     * @returns {sap.m.routing.Router} the router of the application
     */
    getRouter() {
        return this.getOwnerComponent().getRouter();
    }
}
