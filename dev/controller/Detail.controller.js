import BaseController from "./BaseController";
import formatter from "../model/formatter";
import models from "../model/models";
import RepositoryInfoService from "../model/dataAccess/rest/RepositoryInfoService";
import CheckI18nService from "../model/dataAccess/rest/CheckI18nService";
import AsyncDialog from "../model/util/AsyncDialog";
import Log from "sap/base/Log";
import formatMessage from "sap/base/strings/formatMessage";
import MessageToast from "sap/m/MessageToast";
import Fragment from "sap/ui/core/Fragment";

/**
 * Detail View Controller
 *
 * @extends devepos.i18ncheck.controller.BaseController
 * @alias devepos.i18ncheck.controller.Detail
 * @public
 */
export default class DetailController extends BaseController {
    formatter = formatter;
    formatMessage = formatMessage;
    onInit() {
        this._oLayoutModel = this.getOwnerComponent().getLayoutModel();
        this._oBundle = this.getOwnerComponent().getResourceBundle();
        this._oViewModel = models.createViewModel({ ignoreActionEnabled: false, busy: false });
        this._oViewModel.attachPropertyChange(this._onModelUpdated.bind(this));
        this._oTable = this.byId("i18nMessages");
        this.getView().setModel(this._oViewModel, "viewModel");
        const oRouter = this.getRouter();
        oRouter.getRoute("main").attachPatternMatched(this._onRouteMatched, this);
        oRouter.getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
    }
    onMessageTableSelectionChange(oEvent) {
        const oTable = oEvent.getSource();
        this._oViewModel.setProperty("/ignoreActionEnabled", oTable.getSelectedItems()?.length > 0);
    }
    /**
     * Event handler for assigning a git url to a BSP application
     * @param {Object} oEvent event object
     */
    async onAssignGitRepo(oEvent) {
        const oContext = this.getView().getBindingContext();
        const oCurrentBsp = oContext?.getObject();
        if (!oCurrentBsp) {
            return;
        }
        const oDialogContent = await Fragment.load({ type: "XML", name: "devepos.i18ncheck.fragment.ChangeGitRepo" });
        const oDialogModel = models.createViewModel({ url: oCurrentBsp.gitUrl });
        // show dialog
        const oDialog = new AsyncDialog({
            title: this._oBundle.getText("gitRepositoryAssignDialogTitle"),
            width: "45em",
            height: "8em",
            content: oDialogContent,
            model: oDialogModel
        });
        const sResult = await oDialog.showDialog(this.getView());
        if (sResult !== AsyncDialog.OK_BUTTON) {
            return;
        }
        const sGitUrl = oDialogModel.getProperty("/url");
        if (sGitUrl === oCurrentBsp.gitUrl) {
            return;
        }

        try {
            const oRepoInfoService = new RepositoryInfoService();
            await oRepoInfoService.updateRepoInfo({
                bspName: oCurrentBsp.bspName,
                gitUrl: sGitUrl
            });
            oContext.getModel().setProperty(`${oContext.sPath}/gitUrl`, sGitUrl);
            MessageToast.show(this._oBundle.getText("gitRepoUrlUpdated", oCurrentBsp.bspName));
        } catch (oError) {
            Log.error(oError);
        }
    }
    /**
     * Event handler for "Ignore" action in i18n message toolbar
     */
    async onIgnoreFiles() {
        const aSelectedContexts = this._oTable.getSelectedContexts();
        if (aSelectedContexts?.length <= 0) {
            return;
        }
        const oSelectedBsp = this.getView().getBindingContext()?.getObject();
        if (!oSelectedBsp) {
            return;
        }

        this._oViewModel.setProperty("/busy", true);

        const aEntriesToBeIgnored = [];
        for (const oKey of aSelectedContexts) {
            const oContextObj = oKey.getObject();
            if (!oContextObj || oContextObj?.ignored) {
                continue;
            }
            aEntriesToBeIgnored.push({
                bspName: oSelectedBsp.bspName,
                messageType: oContextObj.messageType,
                filePath: oContextObj.file.path,
                fileName: oContextObj.file.name,
                i18nKey: oContextObj.key
            });
        }
        if (aEntriesToBeIgnored.length > 0) {
            try {
                const oResponse = await new CheckI18nService().ignoreResults(aEntriesToBeIgnored);
                if (oResponse?.data?.length > 0) {
                    this._updateTableWithIgnoredEntries(oResponse.data, aSelectedContexts);
                    this.getOwnerComponent().getModel().updateBindings();
                    this._oTable.removeSelections();
                }
            } catch (oError) {
                if (oError?.statusText) {
                    Log.error(oError.statusText);
                } else {
                    Log.error(oError);
                }
            }
        }
        this._oViewModel.setProperty("/busy", false);
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
    _onModelUpdated(oEvent) {
        if (oEvent.getParameter("path") === "/showIgnored") {
            const aFilters = [];
            if (!oEvent.getParameter("value")) {
                aFilters.push(this._oHideIgnoredEntriesFilter);
            }
            this._oTable.getBinding("items")?.filter(aFilters);
        }
    }
    _updateTableWithIgnoredEntries(aIgnoredEntries, aSelectedContexts) {
        if (aIgnoredEntries?.length <= 0) {
            return;
        }
        for (const oSelectedContext of aSelectedContexts) {
            const oSelectedObject = oSelectedContext.getObject();
            // find the selected entry in the response
            const oIgnoredEntry = aIgnoredEntries.find(
                oEntry =>
                    oEntry.fileName === oSelectedObject.file.name &&
                    oEntry.filePath === oSelectedObject.file.path &&
                    oEntry.messageType === oSelectedObject.messageType &&
                    oEntry.i18nKey === oSelectedObject.key
            );
            if (oIgnoredEntry) {
                oSelectedObject.ignEntryUuid = oIgnoredEntry.ignEntryUuid;
            }
        }
    }
}
