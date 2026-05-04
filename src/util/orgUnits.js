import i18n from '@dhis2/d2-i18n'
import { uniqBy } from 'lodash/fp'
import { qualitativeColors } from '../constants/colors.js'
import {
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS,
    ORG_UNIT_RADIUS_SMALL,
    STYLE_TYPE_COLOR,
    STYLE_TYPE_SYMBOL,
    NONE,
} from '../constants/layers.js'
import { getUniqueColor } from './colors.js'
import { toGeoJson } from './map.js'
import {
    FIRST_DATA_ELEMENT_QUERY,
    GEOFEATURES_QUERY,
    ORG_UNITS_COUNT_QUERY,
    ORG_UNIT_DETAILS_QUERY,
} from './requests.js'

const getGroupColor = (groups) => {
    const groupsWithoutColors = groups.filter((g) => !g.color)
    const colors = getUniqueColor(qualitativeColors)
    return (group) => {
        const index = groupsWithoutColors.findIndex((g) => g.id === group.id)
        return colors(index)
    }
}

// Default symbol 21-25 are coloured circles
const getGroupSymbol = (groups) => {
    const groupsWithoutSymbols = groups.filter((g) => !g.symbol)
    return (group) => {
        const index = groupsWithoutSymbols.findIndex((g) => g.id === group.id)
        return index < 5 ? `${21 + index}.png` : '25.png'
    }
}

export const parseGroupSet = ({ organisationUnitGroups: groups }) => {
    groups.sort((a, b) => a.name.localeCompare(b.name))

    const getColor = getGroupColor(groups)
    const getSymbol = getGroupSymbol(groups)

    return groups.map((group) => ({
        ...group,
        color: group.color || getColor(group),
        symbol: group.symbol || getSymbol(group),
    }))
}

export const ORG_UNITS_GROUP_SET_QUERY = {
    groupSets: {
        resource: 'organisationUnitGroupSets',
        id: ({ id }) => id,
        params: {
            fields: ['name,organisationUnitGroups[id,name,color,symbol]'],
        },
    },
}

export const ORG_UNIT_QUERY = {
    orgUnit: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: ({ nameProperty }) => ({
            fields: [`${nameProperty}~rename(name)`],
        }),
    },
}

export const getPointItems = (data) => data.filter((d) => d.ty === 1)

export const getPolygonItems = (data) => data.filter((d) => d.ty === 2)

export const getOrgUnitStyle = (dimensions, groupSet) =>
    groupSet &&
    groupSet.organisationUnitGroups &&
    dimensions &&
    dimensions[groupSet.id]
        ? groupSet.organisationUnitGroups.find(
              (g) => g.id === dimensions[groupSet.id]
          )
        : {}

export const getOrgUnitGroupLegendItems = (
    groups = [],
    useColor,
    contextPath
) =>
    groups.map(({ id, name, color = true, symbol }) =>
        useColor
            ? {
                  id,
                  name,
                  color,
              }
            : {
                  id,
                  name,
                  image: `${contextPath}/images/orgunitgroup/${symbol}`,
              }
    )

export const getStyledOrgUnits = ({
    features = [],
    groupSet = {},
    config: {
        organisationUnitColor = ORG_UNIT_COLOR,
        radiusLow = ORG_UNIT_RADIUS,
    },
    baseUrl,
    orgUnitLevels,
}) => {
    const {
        name,
        styleType = orgUnitLevels ? STYLE_TYPE_COLOR : STYLE_TYPE_SYMBOL,
        organisationUnitGroups = [],
    } = groupSet
    const isFacilityLayer = !orgUnitLevels
    let levelWeight
    let levelItems = []

    if (!isFacilityLayer) {
        const levels = uniqBy((f) => f.properties.level, features)
            .map((f) => f.properties.level)
            .sort()

        levelWeight = (level) =>
            Math.pow(levels.length - levels.indexOf(level), 1.2)

        levelItems = levels.map((level) => ({
            name: orgUnitLevels[level],
            color: organisationUnitColor,
            weight: levelWeight(level),
        }))
    }

    const useColor = styleType === STYLE_TYPE_COLOR

    let styledFeatures = features.map((f) => {
        const isPoint = f.geometry.type === 'Point'
        const { hasAdditionalGeometry } = f.properties
        const { color, symbol } = getOrgUnitStyle(
            f.properties.dimensions,
            groupSet
        )
        let radius

        if (isPoint) {
            radius = hasAdditionalGeometry
                ? ORG_UNIT_RADIUS_SMALL + 1
                : radiusLow
        }

        const properties = {
            ...f.properties,
            radius,
        }

        if (useColor && color) {
            properties.color = hasAdditionalGeometry ? ORG_UNIT_COLOR : color
        } else if (symbol) {
            properties.iconUrl = `${baseUrl}/images/orgunitgroup/${symbol}`
        }

        if (properties.level && levelWeight) {
            properties.weight = levelWeight(f.properties.level)
        }

        return {
            ...f,
            properties,
        }
    })

    // Only include facilities having a group membership
    if (isFacilityLayer && groupSet.id && !useColor) {
        styledFeatures = styledFeatures.filter((f) => f.properties.iconUrl)
    }

    const groupItems = getOrgUnitGroupLegendItems(
        organisationUnitGroups,
        useColor,
        baseUrl
    )

    const facilityItems =
        isFacilityLayer && !groupSet.id
            ? [
                  {
                      name: i18n.t('Facility'),
                      color: organisationUnitColor,
                      radius: radiusLow,
                  },
              ]
            : []

    return {
        styledFeatures,
        legend: {
            unit: name,
            items: groupItems.length
                ? groupItems
                : [...levelItems, ...facilityItems],
        },
    }
}

// Converts "LEVEL-x" to newer "LEVEL-uid" format
export const translateOrgUnitLevels = (orgUnits, orgUnitLevels = []) => {
    const items = orgUnits?.items || []

    return items.map((item) => {
        const levelNumber = item.id.match(/^LEVEL-([0-9])+$/)

        if (levelNumber) {
            const level = orgUnitLevels.find(
                (l) => l.level === Number(levelNumber[1])
            )

            if (level) {
                const { id, name } = level
                return { id: `LEVEL-${id}`, name }
            }
        }

        return item
    })
}

// Returns coordinate field from layer config
export const getCoordinateField = ({ orgUnitField, orgUnitFieldDisplayName }) =>
    orgUnitField && orgUnitField !== NONE
        ? { id: orgUnitField, name: orgUnitFieldDisplayName }
        : null

export const getOrgUnitsWithoutCoordsCount = async ({
    engine,
    orgUnitIds,
    userId,
    features = [],
}) => {
    if (!orgUnitIds.length) {
        return { count: 0, missingOrgUnits: [] }
    }

    try {
        const deResult = await engine.query(FIRST_DATA_ELEMENT_QUERY)
        const dataElementId = deResult?.dataElements?.dataElements?.[0]?.id
        if (!dataElementId) {
            return { error: true }
        }

        const countData = await engine.query(ORG_UNITS_COUNT_QUERY, {
            variables: { dataElementId, orgUnitIds, userId },
        })
        const allOuIds =
            countData?.orgUnitsCount?.metaData?.dimensions?.ou || []
        const metaItems = countData?.orgUnitsCount?.metaData?.items || {}

        const featureIds = new Set(features.map((f) => f.id))
        const missingOrgUnits = allOuIds
            .filter((id) => !featureIds.has(id))
            .map((id) => ({
                id,
                properties: { id, name: metaItems[id]?.name || id },
            }))

        return { count: missingOrgUnits.length, missingOrgUnits }
    } catch {
        return { error: true }
    }
}

const OU_DETAILS_BATCH_SIZE = 100

export const fetchOrgUnitDetails = async (engine, ids) => {
    if (!ids.length) {
        return {}
    }

    const batches = []
    for (let i = 0; i < ids.length; i += OU_DETAILS_BATCH_SIZE) {
        batches.push(ids.slice(i, i + OU_DETAILS_BATCH_SIZE))
    }

    try {
        const results = await Promise.all(
            batches.map((batch) =>
                engine.query(ORG_UNIT_DETAILS_QUERY, {
                    variables: { ids: batch },
                })
            )
        )

        return results.reduce((acc, result) => {
            ;(result.orgUnits.organisationUnits || []).forEach((ou) => {
                acc[ou.id] = { level: ou.level, parentName: ou.parent?.name }
            })
            return acc
        }, {})
    } catch {
        return {}
    }
}

export const addGroupCountsToLegend = (legendItems, features, groupSet) => {
    legendItems.forEach((item) => (item.count = 0))
    features.forEach((f) => {
        const groupId = f.properties?.dimensions?.[groupSet.id]
        const item = legendItems.find((i) => i.id === groupId)
        if (item) {
            item.count++
        }
    })
}

export const addLevelCountsToLegend = (
    legendItems,
    features,
    orgUnitLevels
) => {
    legendItems.forEach((item) => (item.count = 0))
    features.forEach((f) => {
        const levelInfo = orgUnitLevels.find(
            (l) => l.level === f.properties.level
        )
        const item =
            levelInfo &&
            legendItems.find((i) => i.name === levelInfo.displayName)
        if (item) {
            item.count++
        }
    })
}

export const fetchAndParseGroupSet = async (engine, groupSet) => {
    try {
        const { groupSets } = await engine.query(ORG_UNITS_GROUP_SET_QUERY, {
            variables: { id: groupSet?.id },
        })
        return {
            organisationUnitGroups: parseGroupSet({
                organisationUnitGroups: groupSets.organisationUnitGroups,
            }),
            name: groupSets.name,
        }
    } catch {
        return null
    }
}

export const loadGroupSetData = async (engine, groupSet, includeGroupSets) => {
    if (!includeGroupSets || groupSet.organisationUnitGroups) {
        return null
    }
    const parsed = await fetchAndParseGroupSet(engine, groupSet)
    if (!parsed) {
        return i18n.t('GroupSet used for styling was not found')
    }
    groupSet.organisationUnitGroups = parsed.organisationUnitGroups
    groupSet.name = parsed.name
    return null
}

export const fetchAssociatedGeometries = async (
    engine,
    {
        orgUnitIds,
        keyAnalysisDisplayProperty,
        includeGroupSets,
        coordinateField,
        userId,
    },
    filterGeoFeatures = (items) => items
) => {
    const rawData = await engine.query(GEOFEATURES_QUERY, {
        variables: {
            orgUnitIds,
            keyAnalysisDisplayProperty,
            includeGroupSets,
            coordinateField: coordinateField.id,
            userId,
        },
    })
    return rawData?.geoFeatures
        ? toGeoJson(filterGeoFeatures(rawData.geoFeatures))
        : null
}

// Combines main org unit features with associated geometries
export const addAssociatedGeometries = (mainFeatures, associatedGeometries) => {
    // Return main features if there are no associated geomteries
    if (!associatedGeometries) {
        return mainFeatures
    }

    // If there are associated geometries we only return main features that are
    // points - and only if the associated geometry is not existing or not a point.
    // The returned main feature points with an associated geometry gets an extra
    // "hasAdditionalGeometry" property (used to only show the same org unit once
    // in the data table).
    return mainFeatures
        .filter((f) => {
            const associated = associatedGeometries.find((a) => a.id === f.id)

            if (f.geometry.type === 'Point') {
                return associated ? associated.geometry.type !== 'Point' : true
            } else {
                return false
            }
        })
        .map((f) => {
            const associated = associatedGeometries.find((a) => a.id === f.id)

            return associated
                ? {
                      ...f,
                      properties: {
                          ...f.properties,
                          hasAdditionalGeometry: true,
                      },
                  }
                : f
        })
        .concat(associatedGeometries)
}
