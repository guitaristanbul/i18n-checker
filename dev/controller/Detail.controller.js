import BaseController from "./BaseController";
import models from "devepos/i18ncheck/model/models";
import Token from "sap/m/Token";
import constants from "devepos/i18ncheck/model/constants";
import formatter from "devepos/i18ncheck/model/formatter";

/**
 * Detail View Controller
 *
 * @extends devepos.i18ncheck.controller.BaseController
 * @alias devepos.i18ncheck.controller.Detail
 * @public
 */
export default class DetailController extends BaseController {
    formatter = formatter;
    onInit() {
        this._oLayoutModel = this.getOwnerComponent().getLayoutModel();

        const oRouter = this.getRouter();
        oRouter.getRoute("main").attachPatternMatched(this._onRouteMatched, this);
        oRouter.getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        // oRouter.getRoute("detailDetail").attachPatternMatched(this._onRouteMatched, this);
    }
    handleItemPress(oEvent) {
        // var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
        //     supplierPath = oEvent.getSource().getBindingContext("products").getPath(),
        //     supplier = supplierPath.split("/").slice(-1).pop();
        // this.getRouter().navTo("detailDetail", { layout: oNextUIState.layout, product: this._product, supplier: supplier });
    }
    handleFullScreen() {
        const sNextLayout = this._oLayoutModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
        this.getRouter().navTo("detail", { layout: sNextLayout, resultPath: encodeURIComponent(this._sResultPath) });
    }
    handleExitFullScreen() {
        const sNextLayout = this._oLayoutModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
        this.getRouter().navTo("detail", { layout: sNextLayout, resultPath: encodeURIComponent(this._sResultPath) });
    }
    handleClose() {
        var sNextLayout = this._oLayoutModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
        this.getRouter().navTo("main", { layout: sNextLayout });
    }
    _onRouteMatched(oEvent) {
        const sResultPath = decodeURIComponent(oEvent.getParameter("arguments").resultPath) || this._sResultPath || "";
        if (sResultPath) {
            this._sResultPath = sResultPath;
        }

        this.getView().bindElement({
            path: sResultPath
        });
    }
}
