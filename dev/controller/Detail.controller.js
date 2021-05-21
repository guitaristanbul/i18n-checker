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
        this._oViewModel = models.createViewModel({
            excludeActionEnabled: false,
            includeActionEnabled: false,
            busy: false
        });
        this._oTable = this.byId("i18nMessages");
        this.getView().setModel(this._oViewModel, "viewModel");
        const oRouter = this.getRouter();
        oRouter.getRoute("main").attachPatternMatched(this._onRouteMatched, this);
        oRouter.getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
    }
    onMessageTableSelectionChange() {
        let bEnableExcludeAction = false;
        let bEnableIncludeAction = false;
        for (const oSelectedContext of this._oTable.getSelectedContexts()) {
            if (oSelectedContext.getProperty("ignEntryUuid")) {
                bEnableIncludeAction = true;
            } else {
                bEnableExcludeAction = true;
            }
        }
        this._oViewModel.setProperty("/excludeActionEnabled", bEnableExcludeAction);
        this._oViewModel.setProperty("/includeActionEnabled", bEnableIncludeAction);
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
        const oDialogModel = models.createViewModel({ url: oCurrentBsp.gitUrl });
        // show dialog
        const oDialog = new AsyncDialog({
            title: this._oBundle.getText("gitRepositoryAssignDialogTitle"),
            width: "45em",
            height: "8em",
            content: await Fragment.load({ type: "XML", name: "devepos.i18ncheck.fragment.ChangeGitRepo" }),
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
     * Event handler for "Exclude" action in i18n messages table toolbar
     */
    async onExcludeMessages() {
        this._createIgnoreMessageEntries(
            oObj => !oObj.ignEntryUuid,
            oObj => {
                return {
                    messageType: oObj.messageType,
                    filePath: oObj.file.path,
                    fileName: oObj.file.name,
                    i18nKey: oObj.key
                };
            },
            this._updateIgnoreEntries.bind(this)
        );
    }
    /**
     * Event handler for "Include" action in i18n messages table toolbar
     */
    async onIncludeMessages() {
        this._createIgnoreMessageEntries(
            oObj => !!oObj.ignEntryUuid,
            oObj => {
                return {
                    ignEntryUuid: oObj.ignEntryUuid
                };
            },
            this._clearIgnoredKeyFromEntries.bind(this),
            true
        );
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
    /**
     * Creates/Deletes ignore entries for selected i18n messages
     * @param {Function} fnFilterSelection function for filtering selected messages
     * @param {Function} fnGetObject function for retrieving the object for the request
     * @param {Function} fnResponsePostProcess function for post processing after successful service call
     * @param {boolean} bDelete flag to indicate that ignore entries should be deleted
     */
    async _createIgnoreMessageEntries(fnFilterSelection, fnGetObject, fnResponsePostProcess, bDelete) {
        const aSelectedContexts = this._oTable.getSelectedContexts();
        if (aSelectedContexts?.length <= 0) {
            return;
        }
        const oSelectedBsp = this.getView().getBindingContext()?.getObject();
        if (!oSelectedBsp) {
            return;
        }

        this._oViewModel.setProperty("/busy", true);

        const aIncludeExclude = [];
        const aRelevantSelections = [];
        for (const oContext of aSelectedContexts) {
            const oContextObj = oContext.getObject();
            if (!fnFilterSelection(oContextObj)) {
                continue;
            }
            aRelevantSelections.push(oContext);
            aIncludeExclude.push(Object.assign({ bspName: oSelectedBsp.bspName }, fnGetObject(oContextObj)));
        }
        if (aIncludeExclude.length > 0) {
            try {
                const oCheckService = new CheckI18nService();
                const oResponse = bDelete
                    ? await oCheckService.deleteIgnoredMessages(aIncludeExclude)
                    : await oCheckService.ignoreMessages(aIncludeExclude);
                if (oResponse?.data?.length > 0) {
                    fnResponsePostProcess(oResponse.data, aRelevantSelections);
                    this.getOwnerComponent().getModel().updateBindings();
                    this._oTable.removeSelections();
                    const sTextKey = bDelete ? "messagesIncludedSuccess" : "messagesExcludedSuccess";
                    MessageToast.show(this._oBundle.getText(sTextKey, oResponse?.data?.length));
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
    _clearIgnoredKeyFromEntries(aResponseEntries, aContexts) {
        if (aResponseEntries?.length !== aContexts?.length) {
            return;
        }
        for (const oContext of aContexts) {
            const oContextObj = oContext.getObject();
            oContextObj.ignEntryUuid = "";
        }
    }
    _updateIgnoreEntries(aExcludedEntries, aContexts) {
        if (aExcludedEntries?.length !== aContexts?.length) {
            return;
        }
        for (const oSelectedContext of aContexts) {
            const oSelectedObject = oSelectedContext.getObject();
            // find the selected entry in the response
            const oIgnoredEntry = aExcludedEntries.find(
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
