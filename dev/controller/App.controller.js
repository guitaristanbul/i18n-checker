import BaseController from "devepos/i18ncheck/controller/BaseController";
/**
 * App controller
 *
 * @extends devepos.i18ncheck.controller.BaseController
 * @alias devepos.i18ncheck.controller.App
 * @public
 */
export default class AppController extends BaseController {
    onInit() {
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter.attachRouteMatched(this.onRouteMatched, this);
        this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
    }

    onBeforeRouteMatched(oEvent) {
        const oModel = this.getOwnerComponent().getLayoutModel();
        let sLayout = oEvent.getParameters().arguments.layout;

        // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
        if (!sLayout) {
            const oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
            sLayout = oNextUIState.layout;
        }

        // Update the layout of the FlexibleColumnLayout
        if (sLayout) {
            oModel.setProperty("/layout", sLayout);
        }
    }

    onRouteMatched(oEvent) {
        const sRouteName = oEvent.getParameter("name");
        const oArguments = oEvent.getParameter("arguments");

        this._updateUIElements();

        // Save the current route name
        this._sCurrentRouteName = sRouteName;
        this._sCurrentPath = oArguments.resultPath;
        this._sCurrentDetailEntryPath = oArguments.detailPath;
    }

    onStateChanged(oEvent) {
        const bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
        const sLayout = oEvent.getParameter("layout");

        this._updateUIElements();

        // Replace the URL with the new layout if a navigation arrow was used
        if (bIsNavigationArrow) {
            this.oRouter.navTo(
                this._sCurrentRouteName,
                { layout: sLayout, resultPath: this._sCurrentPath, detailPath: this._sCurrentDetailEntryPath },
                true
            );
        }
    }

    // Update the close/fullscreen buttons visibility
    _updateUIElements() {
        const oModel = this.getOwnerComponent().getLayoutModel();
        const oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
        oModel.setData(oUIState);
    }

    onExit() {
        this.oRouter.detachRouteMatched(this.onRouteMatched, this);
        this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
    }
}
