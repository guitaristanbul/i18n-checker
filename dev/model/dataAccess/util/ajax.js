import $ from "jQuery.sap.global";

export default {
    /**
     * CSRF Token Header
     */
    CSRF_TOKEN_HEADER: "X-CSRF-Token",
    /**
     * Promisfied AJAX call
     * @param {string} sUrl request url
     * @param {Map} mSettings map of settings
     * @param {Object} mSettings.headers optional http headers
     * @param {string} mSettings.method request method (e.g. GET/POST/PUT)
     * @returns {Promise<Object>} promise to ajax request
     * @public
     */
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
