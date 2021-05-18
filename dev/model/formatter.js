export default {
    getTextForKey(sKey) {
        return this.getView()?.getModel("i18n")?.getResourceBundle()?.getText(sKey) || sKey;
    },

    getRepoTypeText(bIsApp) {
        return this.getView()
            ?.getModel("i18n")
            ?.getResourceBundle()
            ?.getText(bIsApp ? "repoTypeApp" : "repoTypeLibrary");
    }
};
