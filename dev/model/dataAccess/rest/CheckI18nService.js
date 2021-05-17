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
     * @param {string[]} mParams.targetLanguages array of target languages
     * @param {string[]} mParams.bspNames array of BSP name filters
     * @returns {Promise<Object>} promise of service response
     */
    async retrieveCheckResults() {
        // TODO: fill url paramaters
        ajax.send("/sap/bc/zi18nchk_ignr/checkResults");
    }
}
