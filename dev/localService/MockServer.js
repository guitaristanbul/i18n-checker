import MockServer from "sap/ui/core/util/MockServer";
import Log from "sap/base/Log";
import UriParameters from "sap/base/util/UriParameters";
import ajax from "devepos/i18ncheck/model/dataAccess/util/ajax";

let oMockServer;
const APP_MODULE_PATH = "devepos/i18ncheck/";
const JSON_FILES_MODULE_PATH = APP_MODULE_PATH + "localService/mockdata/";

export default {
    /**
     * Initializes the mock server.
     * You can configure the delay with the URL parameter "serverDelay".
     * The local mock data in this folder is returned instead of the real data for testing.
     * @public
     *
     */
    init() {
        const oUriParameters = new UriParameters(window.location.href);
        const sMockServerUrl = "/sap/bc/zi18nchksrv/";

        oMockServer = new MockServer({
            rootUri: sMockServerUrl
        });

        // configure mock server with a delay of 1s
        MockServer.config({
            autoRespond: true,
            autoRespondAfter: oUriParameters.get("serverDelay") || 1000
        });

        const getJson = (xhr, jsonFileName) => {
            const localUri = sap.ui.require.toUrl(JSON_FILES_MODULE_PATH + jsonFileName + ".json");
            const json = ajax.sendSync(localUri);
            if (json.status === 200) {
                xhr.respondJSON(200, {}, json.data);
            } else {
                xhr.respondJSON(json.status, {}, []);
            }
            return true;
        };
        oMockServer.setRequests([
            {
                method: "GET",
                path: /checkResults.*/,
                response: xhr => {
                    return getJson(xhr, "checkResults");
                }
            },
            {
                method: "HEAD",
                path: /.*/,
                response: xhr => {
                    xhr.respond(200, { "X-CSRF-Token": "Dummy" });
                }
            },
            {
                method: "POST",
                path: /repoInfos.*/,
                response: xhr => {
                    xhr.respondJSON(200, {}, {});
                }
            }
        ]);
        oMockServer.start();

        Log.info("Running the app with mock data");
    },

    /**
     * Returns the mockserver of the app, should be used in integration tests
     * @public
     * @returns {sap.ui.core.util.MockServer} Mockserver instance
     */
    getMockServer() {
        return oMockServer;
    }
};
