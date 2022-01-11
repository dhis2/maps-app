const { chromeAllowXSiteCookies } = require('@dhis2/cypress-plugins');

module.exports = on => {
    chromeAllowXSiteCookies(on);
};
