// VERSION-TOGGLE: tracker/trackedEntities params and response renamed in 2.41
// https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
export const serverSupportsTracker41Api = (serverVersion) =>
    serverVersion?.minor >= 41

// VERSION-TOGGLE: analytics/trackedEntities/query doesn't exist on 2.40
export const serverSupportsTrackedEntityAnalytics = (serverVersion) =>
    serverVersion?.minor >= 41

// VERSION-TOGGLE: analytics id column "trackedentityinstanceuid" renamed in 2.42
export const serverSupportsTrackedEntityAnalyticsIdColumn = (serverVersion) =>
    serverVersion?.minor >= 42
