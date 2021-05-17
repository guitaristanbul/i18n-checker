import $ from "jQuery.sap.global";

export default {
    /**
     * Promisfied AJAX call
     * @param {string} sUrl request url
     * @param {Map} mSettings map of settings
     * @param {Object} mSettings.headers optional http headers
     * @param {string} mSettings.method request method (e.g. GET/POST/PUT)
     * @returns {Promise<Object>} promise to ajax request
     * @public
     */
    CSRF_TOKEN_HEADER: "X-CSRF-Token",
    send(sUrl, { headers = {}, method = "GET", data = undefined, username = "", password = "" } = {}) {
        return new Promise((fnResolve, fnReject) => {
            $.ajax({
                url: sUrl,
                headers: headers,
                method: method,
                username,
                password,
                data: data,
                success: (oData, sStatus, oXhr) => {
                    fnResolve({ data: oData, status: sStatus, request: oXhr });
                },
                error: (oXhr, sStatus, sError) => {
                    fnReject({ status: oXhr.status, statusText: sError });
                }
            });
        });
    },
    /**
     * Fetches CSRF token
     * @param {string} sUrl the url for the fetch request
     *      Ideally this should be an endpoint on the service for which data
     *      requests should be made
     * @returns {Promise<string>} the value of the CSRF-Token
     * @public
     */
    async fetchCSRF(sUrl) {
        const oResult = await this.send(sUrl, {
            headers: {
                [this.CSRF_TOKEN_HEADER]: "Fetch",
                accept: "*/*"
            }
        });
        return oResult?.request?.getResponseHeader(this.CSRF_TOKEN_HEADER);
    }
};
