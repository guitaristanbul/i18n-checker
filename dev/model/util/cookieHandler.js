const LANGUAGE_COOKIE = "flp.plugins.logoninfo.languages";
const CLIENT_COOKIE = "flp.plugins.logoninfo.clients";
/**
 * Sets a new cookie
 * @param {string} sName The id of the cookie to set
 * @param {string} sValue the value of the cookie to set
 */
function setCookie(sName, sValue) {
    document.cookie = `${sName}=${sValue};path=/`;
}

/**
 * Retrieves the value of the given cookie name
 * @param {string} sCookieName the name of a cookie
 * @returns {string} the value of the cookie if it exists
 */
function getCookie(sCookieName) {
    const sName = `${sCookieName}=`;

    var aAllCookies = document.cookie.split(";");
    for (var i = 0; i < aAllCookies.length; i++) {
        var sCookie = aAllCookies[i];
        while (sCookie.charAt(0) == " ") {
            sCookie = sCookie.substring(1);
        }
        if (sCookie.indexOf(sName) == 0) {
            return sCookie.substring(sName.length, sCookie.length);
        }
    }
    return "";
}
/**
 * Handles all things cookie ;)
 */
export default {};
