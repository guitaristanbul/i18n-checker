import BaseController from "./BaseController";
import Log from "sap/base/Log";
import formatter from "devepos/i18ncheck/model/formatter";
import formatMessage from "sap/base/strings/formatMessage";
import models from "devepos/i18ncheck/model/models";
import RepositoryInfoService from "devepos/i18ncheck/model/dataAccess/rest/RepositoryInfoService";
import AsyncDialog from "devepos/i18ncheck/model/util/AsyncDialog";
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
        this._oViewModel = models.createViewModel({ ignoreActionEnabled: false });
        this.getView().setModel(this._oViewModel, "viewModel");
        const oRouter = this.getRouter();
        oRouter.getRoute("main").attachPatternMatched(this._onRouteMatched, this);
        oRouter.getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        // oRouter.getRoute("detailDetail").attachPatternMatched(this._onRouteMatched, this);
    }
    onMessageTableSelectionChange(oEvent) {
        const oTable = oEvent.getSource();
        this._oViewModel.setProperty("/ignoreActionEnabled", oTable.getSelectedItems()?.length > 0);
    }
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
