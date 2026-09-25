// VERSION-TOGGLE: pre-2.44, an eventCoordinateFieldFallback pointed at a
// custom ORGANISATION_UNIT field crashes analytics (E7145) and geometrySource
// is never returned. 2.44+ fixes E7145 and returns geometrySource whenever a
// fallback is configured.
export const serverSupportsGeometrySource = (serverVersion) =>
    serverVersion?.minor >= 44

// VERSION-TOGGLE: ORGANISATION_UNIT-type fields became usable as a
// (non-fallback) coordinate field in 2.40.8, 2.41.4, and 2.42.0 - see
// DHIS2-19010.
export const serverSupportsOrgUnitCoordinateField = (serverVersion) =>
    (serverVersion?.minor === 40 && serverVersion.patch >= 8) ||
    (serverVersion?.minor === 41 && serverVersion.patch >= 4) ||
    serverVersion?.minor >= 42

// VERSION-TOGGLE: mapView.eventCoordinateFieldFallback isn't a schema field
// pre-2.43, so it can't be saved as a native property - store it in the
// config JSON blob instead below that version.
export const serverSupportsEventCoordinateFieldFallback = (serverVersion) =>
    serverVersion?.minor >= 43
