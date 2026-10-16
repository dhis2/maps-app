// VERSION-TOGGLE: tracker/trackedEntities params and response renamed in 2.41
// https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
export const serverSupportsTracker41Api = (serverVersion) =>
    serverVersion?.minor >= 41
