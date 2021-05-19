import $ from "jQuery.sap.global";

export default {
    /**
     * CSRF Token Header
     */
    CSRF_TOKEN_HEADER: "X-CSRF-Token",
    /**
     * Promisfied AJAX call
     * @param {string} sUrl request url
     * @param {Object} parameters parameters for the request
     * @param {Object} parameters.headers optional http headers
     * @param {Object} parameters.data payload for the request
     * @param {string} parameters.dataType the expected data type (default: json)
     * @param {string} parameters.username username for basic authentication
     * @param {string} parameters.password password for basic authentication
     * @param {string} parameters.method request method (e.g. GET/POST/PUT)
     * @returns {Promise<Object>} promise to ajax request
     * @public
     */
    send(
        sUrl,
        { headers = {}, method = "GET", data = undefined, dataType = "json", username = "", password = "" } = {}
    ) {
        return new Promise((fnResolve, fnReject) => {
            $.ajax({
                url: sUrl,
                headers: headers,
                method: method,
                username,
                dataType,
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
     * Fetches Data synchronously
     * @param {string} sUrl url for the request
     * @param {Object} parameters Parameters
     * @param {String} parameters.method Request method
     * @param {String} parameters.url URL string for request
     * @param {Array|Object} parameters.data Optional payload for the request,
     * @param {String} parameters.dataType The expected result type of the response
     * @param {Map} parameters.headers Optional map with request headers (key/value pairs)
     * @returns {Object} the result of synchronous request
     */
    sendSync(sUrl, { method = "GET", data, dataType = "json", headers = {} } = {}) {
        let oResponse;
        $.ajax({
            method,
            url: sUrl,
            data,
            dataType,
            async: false,
            headers,
            success: (oData, sStatusText, oJqXHR) => {
                oResponse = { data: oData, status: oJqXHR.status };
            },
            error: (oJqXHR, statusText, sError) => {
                oResponse = { error: sError, status: oJqXHR.status };
            }
        });

        return oResponse;
    },
    /**
     * Fetches CSRF token
     * @param {boolean} bInvalidate if <code>true</code> the token will be fetched again from the backend
     * @returns {Promise<string>} the value of the CSRF-Token
     * @public
     */
    async fetchCSRF(bInvalidate = false) {
        if (bInvalidate) {
            this._sCSRFToken = "";
        }
        if (this._sCSRFToken) {
            return this._sCSRFToken;
        }
        const oResult = await this.send("/sap/bc/zi18nchksrv/", {
            method: "HEAD",
            headers: {
                [this.CSRF_TOKEN_HEADER]: "Fetch",
                accept: "*/*"
            }
        });
        this._sCSRFToken = oResult?.request?.getResponseHeader(this.CSRF_TOKEN_HEADER);
        return this._sCSRFToken;
    }
};
