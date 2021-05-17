import ajax from "devepos/i18ncheck/model/dataAccess/util/ajax";

/**
 * Service for accessing i18n translation check results
 * @alias devepos.i18ncheck.model.dataAccess.rest.CheckI18nService
 */
export default class CheckI18nService {
    /**
     * Retrieves a list of check i18n translation check results
     * @param {Map} mParams map of parameters
     * @param {string} mParams.defaultLangauge default language as base line for comparison
     * @param {boolean} mParams.compareAgainstDefaultFile
     *   if <code>true</code> the default file will be used for comparison
     * @param {string} mParams.targetLanguages comma separated list of target languages
     * @param {string} mParams.bspNames comma separated list oof BSP name filters
     * @returns {Promise<Object>} promise of service response
     */
    async checkTranslations(mParams) {
        let sUrlParams = `?defLang=${mParams.defaultLanguage}`;
        sUrlParams += `&compAgainstDef=${mParams.compareAgainstDefaultFile}`;
        sUrlParams += `&trgtLang=${mParams.targetLanguages}`;
        sUrlParams += `&bspName=${mParams.bspNames}`;
        return ajax.send(`/sap/bc/zi18nchksrv/checkResults${sUrlParams}`);
    }
}
