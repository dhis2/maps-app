// VERSION-TOGGLE: tracker/trackedEntities params and response changed in 2.41
// (orgUnit/ouMode/skipPaging => orgUnits/orgUnitMode/paging, ";" => "," org
// unit separator, "instances" => "trackedEntities") - see
// https://github.com/dhis2/dhis2-releases/tree/master/releases/2.41#deprecated-apis
export const serverSupportsTracker41Api = (serverVersion) =>
    serverVersion?.minor >= 41

// VERSION-TOGGLE: analytics/trackedEntities/query doesn't exist on 2.40 (404),
// so tracked entities are loaded from tracker/trackedEntities there.
export const serverSupportsTrackedEntityAnalytics = (serverVersion) =>
    serverVersion?.minor >= 41

// VERSION-TOGGLE: the tracker analytics id column was renamed from
// "trackedentityinstanceuid" to "trackedentity" in 2.42.
export const serverSupportsTrackedEntityAnalyticsIdColumn = (serverVersion) =>
    serverVersion?.minor >= 42
