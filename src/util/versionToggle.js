// VERSION-TOGGLE: pre-2.44, a fallbackCoordinateField pointed at a custom
// ORGANISATION_UNIT field crashes analytics (E7145) and geometrySource is
// never returned. 2.44+ fixes E7145 and returns geometrySource whenever a
// fallback is configured.
export const serverSupportsGeometrySource = (serverVersion) =>
    serverVersion?.minor >= 44
