import ajax from "devepos/i18ncheck/model/dataAccess/util/ajax";
import constants from "devepos/i18ncheck/model/constants";

/**
 * Service for accessing i18n translation check results
 * @alias devepos.i18ncheck.model.dataAccess.rest.CheckI18nService
 */
export default class CheckI18nService {
    /**
     * Retrieves a list of check i18n translation check results
     * @param {Object} parameters parameters
     * @param {string} parameters.defaultLangauge default language as base line for comparison
     * @param {boolean} parameters.compareAgainstDefaultFile
     *   if <code>true</code> the default file will be used for comparison
     * @param {string} parameters.targetLanguages comma separated list of target languages
     * @param {string} parameters.bspNames comma separated list oof BSP name filters
     * @param {boolean} parameters.showExcludedEntries if <code>true</code> previously excluded entries will also be read
     * @returns {Promise<Object>} promise of service response
     */
    async checkTranslations({
        defaultLanguage,
        compareAgainstDefaultFile,
        bspNames,
        targetLanguages,
        showExcludedEntries = false
    }) {
        let sUrlParams = `?defLang=${defaultLanguage}`;
        sUrlParams += `&compAgainstDef=${compareAgainstDefaultFile}`;
        sUrlParams += `&showExcluded=${showExcludedEntries}`;
        targetLanguages.split(",").forEach(sTrgtLang => (sUrlParams += `&trgtLang=${sTrgtLang}`));
        bspNames.split(",").forEach(sBspName => (sUrlParams += `&bspName=${sBspName}`));
        return ajax.send(`${constants.SRV_ROOT}/checkResults${sUrlParams}`);
    }

    /**
     * Sets the files contained in 'oIgnorePayload' to ignored
     * @param {Object} oIgnorePayload files to be ignored
     * @returns {Promise<JSON>} a promise of the response result
     */
    async ignoreResults(oIgnorePayload) {
        const sToken = await ajax.fetchCSRF();
        return ajax.send(`${constants.SRV_ROOT}/ignoreKeys`, {
            data: JSON.stringify(oIgnorePayload),
            method: "POST",
            CSRFToken: sToken
        });
    }
}
