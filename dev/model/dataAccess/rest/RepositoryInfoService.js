import ajax from "devepos/i18ncheck/model/dataAccess/util/ajax";

const SERVICE_URL = `/sap/bc/zi18nchksrv/repoInfos`;
/**
 * Service for accessing additional information about a UI5 repository
 * aka BSP application
 * @alias devepos.i18ncheck.model.dataAccess.rest.RepositoryInfoService
 */
export default class RepositoryInfoService {
    /**
     * Retrieves a list of check i18n translation check results
     * @param {Object} parameters parameters
     * @param {string} parameters.bspName name of BSP application
     * @param {string} parameters.gitUrl url to git repository
     * @returns {Promise<Object>} promise of service response
     */
    async updateRepoInfo({ bspName, gitUrl }) {
        if (!bspName) {
            return null;
        }
        const sToken = await ajax.fetchCSRF();

        return ajax.send(SERVICE_URL, {
            method: "POST",
            headers: {
                [ajax.CSRF_TOKEN_HEADER]: sToken
            },
            data: JSON.stringify({ bspName, gitUrl })
        });
    }
}
