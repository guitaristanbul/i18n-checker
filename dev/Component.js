import UIComponent from "sap/ui/core/UIComponent";
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

    destroy() {
        UIComponent.prototype.destroy.apply(this, arguments);
    }
}
