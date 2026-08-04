import { ORG_UNIT_PATH_DATA_KEY } from '../constants/dataTable.js'
import { filterData } from './filter.js'
import { matchFeaturesToReferenceOrgUnits } from './spatialJoin.js'

export const getJoinableFeatures = (layer) =>
    [...(layer?.data ?? []), ...(layer?.dataWithoutCoords ?? [])].filter(
        (d) => !d.properties?.hasAdditionalGeometry
    )

export const getFilteredJoinableFeatures = (layer) =>
    filterData(getJoinableFeatures(layer), layer?.dataFilters)

export const getProps = (feature) => feature.properties || feature

export const matchOrgUnitReference = (
    features,
    referenceOrgUnits,
    referenceByPath
) => {
    const byReferenceId = new Map()
    features.forEach((feature) => {
        const props = getProps(feature)
        const path = props[ORG_UNIT_PATH_DATA_KEY]
        if (!path) {
            return
        }
        const reference =
            referenceByPath.get(path) ??
            referenceOrgUnits.find((ref) =>
                path.startsWith(`${getProps(ref)[ORG_UNIT_PATH_DATA_KEY]}/`)
            )
        if (!reference) {
            return
        }
        const referenceId = getProps(reference).id
        if (!byReferenceId.has(referenceId)) {
            byReferenceId.set(referenceId, [])
        }
        byReferenceId.get(referenceId).push(props)
    })
    return byReferenceId
}

export const matchSpatialReference = (features, referenceOrgUnits) => {
    const byReferenceId = new Map()
    const matched = matchFeaturesToReferenceOrgUnits(
        features,
        referenceOrgUnits,
        { useCentroid: true }
    )
    matched.forEach(({ featureProps, referenceId }) => {
        if (referenceId == null) {
            return
        }
        if (!byReferenceId.has(referenceId)) {
            byReferenceId.set(referenceId, [])
        }
        byReferenceId.get(referenceId).push(featureProps)
    })
    return byReferenceId
}

export const getByReferenceId = (features, referenceOrgUnits, joinType) => {
    if (joinType === 'spatial') {
        return matchSpatialReference(features, referenceOrgUnits)
    }
    const referenceByPath = new Map(
        referenceOrgUnits.map((ref) => [
            getProps(ref)[ORG_UNIT_PATH_DATA_KEY],
            ref,
        ])
    )
    return matchOrgUnitReference(features, referenceOrgUnits, referenceByPath)
}

export const hasCombinedRollup = (layer, referenceLayer, joinType) => {
    const referenceOrgUnits = getJoinableFeatures(referenceLayer)
    if (!referenceOrgUnits.length) {
        return false
    }
    const byReferenceId = getByReferenceId(
        getFilteredJoinableFeatures(layer),
        referenceOrgUnits,
        joinType
    )
    return Array.from(byReferenceId.values()).some(
        (matches) => matches.length > 1
    )
}

export const getUnmatchedFeatureCount = (layer, referenceLayer, joinType) => {
    const referenceOrgUnits = getJoinableFeatures(referenceLayer)
    const features = getFilteredJoinableFeatures(layer)
    if (!referenceOrgUnits.length || !features.length) {
        return 0
    }
    const byReferenceId = getByReferenceId(
        features,
        referenceOrgUnits,
        joinType
    )
    const matched = Array.from(byReferenceId.values()).reduce(
        (sum, matches) => sum + matches.length,
        0
    )
    return features.length - matched
}
