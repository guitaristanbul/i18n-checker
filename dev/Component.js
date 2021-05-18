import UIComponent from "sap/ui/core/UIComponent";
import FlexibleColumnLayoutSemanticHelper from "sap/f/FlexibleColumnLayoutSemanticHelper";
import UriParameters from "sap/base/util/UriParameters";
import models from "./model/models";

/**
 * @extends sap.ui.core.UIComponent
 * @alias devepos.i18ncheck.Component
 */
export default class I18nCheckerComponent extends UIComponent {
    metadata = {
        manifest: "json"
    };

    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);
        // enable routing
        this.getRouter().initialize();
        // set the device model
        this.setModel(models.createDeviceModel(), "device");
        this._oLayoutModel = models.createViewModel();
        this.setModel(this._oLayoutModel, "layout");
    }

    /**
     * Returns model which is concerned with the layout
     * @returns {sap.ui.model.json.JSONModel} the model for the layout
     */
    getLayoutModel() {
        return this._oLayoutModel;
    }
    /**
     * Returns the i18n bundle
     * @returns {sap.base.i18n.ResourceBundle} the i18n resource bundle
     */
    getResourceBundle() {
        if (!this._oBundle) {
            this._oBundle = this.getModel("i18n")?.getResourceBundle();
        }
        return this._oBundle;
    }

    /**
     * Returns an instance of the semantic helper
     * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
     */
    getHelper() {
        const oFlexColLayout = this.getRootControl().byId("flexColLayout");
        const oParams = new UriParameters(window.location.href);
        const oSettings = {
            defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
            defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsMidExpanded,
            mode: oParams.get("mode"),
            initialColumnsCount: oParams.get("initial"),
            maxColumnsCount: oParams.get("max")
        };

        return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFlexColLayout, oSettings);
    }

    destroy() {
        UIComponent.prototype.destroy.apply(this, arguments);
    }
}
