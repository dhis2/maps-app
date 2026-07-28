import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import {
    ORG_UNIT_PATH_DATA_KEY,
    ORG_UNIT_LEVEL_DATA_KEY,
    SORT_ASCENDING,
    TYPE_NUMBER,
    TYPE_STRING,
} from '../../constants/dataTable.js'
import { applyAggregation } from '../../util/aggregation.js'
import { filterByGlobalSearch, filterData } from '../../util/filter.js'
import { matchFeaturesToReferenceOrgUnits } from '../../util/spatialJoin.js'
import {
    buildRowCells,
    getColumnDistinctValues,
    sortColumnOptions,
} from '../../util/tableColumns.js'
import { compareRows } from '../../util/tableSort.js'

const VALUE_KEY = 'rawValue'
const LEGEND_KEY = 'legend'
const LARGE_FEATURE_THRESHOLD = 10000
const DEFAULT_AGGREGATION = 'SUM'

// Mirrors util/tableRows.js's own data + dataWithoutCoords merge for the
// single-layer table - org units/facilities missing valid coordinates
// still belong in the join, they just can't render on the map.
const getJoinableFeatures = (layer) =>
    [...(layer?.data ?? []), ...(layer?.dataWithoutCoords ?? [])].filter(
        (d) => !d.properties?.hasAdditionalGeometry
    )

const getProps = (feature) => feature.properties || feature

// A feature belongs to a reference org unit if it IS that org unit, or is
// one of its descendants (a path-prefix match) - "the reference OU or
// lower, using the hierarchy". Reference org units are usually all one
// level, so most features hit the direct-match Map; only a genuine
// descendant needs the O(referenceOrgUnits) prefix scan.
const matchOrgUnitReference = (
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

// useCentroid: true unconditionally - getTestPoint (spatialJoin.js) already
// tests a feature as-is when it's literally a Point, so this only takes
// effect for non-point geometry, regardless of layer type (see
// isSpatialEligible in JoinLayersControl.jsx, which is what actually
// decides whether "Spatial" is offered for a given layer in the first
// place).
const matchSpatialReference = (features, referenceOrgUnits) => {
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

// Shared across every row: apply Combined's own local filters/global
// search (reusing the same utilities as the single-layer table), sort by
// natural insertion order (via each flat row's index) when no sort column is
// active, then build the final {dataKey, value, align, itemId} cell shape.
const finalizeRows = (
    flatRows,
    headers,
    { filters, globalSearch, sortField, sortDirection }
) => {
    let data = filterData(flatRows, filters)

    if (globalSearch?.trim()) {
        const stringDataKeys = headers
            .filter((h) => h.type === TYPE_STRING)
            .map((h) => h.dataKey)
        data = filterByGlobalSearch(data, globalSearch, { stringDataKeys })
    }

    data = [...data].sort((a, b) =>
        compareRows(a, b, { sortField, sortDirection })
    )

    return data.map((row) => buildRowCells(row, headers))
}

const EMPTY_COLUMN_OPTIONS = {}

const EMPTY_RESULT = {
    headers: [],
    rows: [],
    rowFeatureIds: new Map(),
    columnOptions: EMPTY_COLUMN_OPTIONS,
    spatialWarning: false,
}

// layers: the participating layers (each with joinConfig.layers[layer.id] =
// {type, aggregation}), NOT including the reference layer itself.
// referenceLayer: the hidden combinedTableRef layer backing the join - its
// own fetched org units are the row set, always, regardless of whether any
// participating layer has data for a given one.
export const useCombinedTableData = ({
    layers,
    referenceLayer,
    joinConfig,
    sortField = null,
    sortDirection = SORT_ASCENDING,
    filters,
    globalSearch,
}) => {
    const referenceOrgUnits = useMemo(
        () => getJoinableFeatures(referenceLayer),
        [referenceLayer]
    )

    const referenceByPath = useMemo(
        () =>
            new Map(
                referenceOrgUnits.map((ref) => [
                    getProps(ref)[ORG_UNIT_PATH_DATA_KEY],
                    ref,
                ])
            ),
        [referenceOrgUnits]
    )

    const layerMatches = useMemo(
        () =>
            layers.map((layer) => {
                const settings = joinConfig.layers[layer.id] ?? {
                    type: 'orgUnit',
                    aggregation: {},
                }
                const features = getJoinableFeatures(layer)
                const byReferenceId =
                    settings.type === 'spatial'
                        ? matchSpatialReference(features, referenceOrgUnits)
                        : matchOrgUnitReference(
                              features,
                              referenceOrgUnits,
                              referenceByPath
                          )
                return { layer, settings, byReferenceId }
            }),
        [layers, joinConfig, referenceOrgUnits, referenceByPath]
    )

    return useMemo(() => {
        if (!referenceOrgUnits.length) {
            return EMPTY_RESULT
        }

        const spatialWarning =
            referenceOrgUnits.length > LARGE_FEATURE_THRESHOLD ||
            layerMatches.some(
                ({ layer, settings }) =>
                    settings.type === 'spatial' &&
                    (layer.data?.length ?? 0) > LARGE_FEATURE_THRESHOLD
            )

        const headers = [
            { name: i18n.t('ID'), dataKey: 'id', type: TYPE_STRING },
            { name: i18n.t('Name'), dataKey: 'name', type: TYPE_STRING },
            { name: i18n.t('Level'), dataKey: 'level', type: TYPE_NUMBER },
            ...layerMatches.flatMap(({ layer }) => [
                {
                    name: i18n.t('Value ({{layer}})', { layer: layer.name }),
                    dataKey: `${layer.id}_${VALUE_KEY}`,
                    type: TYPE_NUMBER,
                },
                {
                    name: i18n.t('Legend ({{layer}})', { layer: layer.name }),
                    dataKey: `${layer.id}_${LEGEND_KEY}`,
                    type: TYPE_STRING,
                },
            ]),
        ]

        const rowFeatureIds = new Map()

        const flatRows = referenceOrgUnits.map((referenceFeature, index) => {
            const refProps = getProps(referenceFeature)
            const row = {
                id: refProps.id,
                name: refProps.name ?? null,
                level: refProps[ORG_UNIT_LEVEL_DATA_KEY] ?? null,
                index,
            }

            // Always includes the reference org unit's own feature, so
            // "zoom to feature" has real bounds even when no participating
            // layer has a match for this row.
            const featureIds = { [referenceLayer.id]: [refProps.id] }

            layerMatches.forEach(({ layer, settings, byReferenceId }) => {
                const matches = byReferenceId.get(refProps.id) ?? []
                const values = matches
                    .map((p) => p[VALUE_KEY])
                    .filter((v) => v != null)
                row[`${layer.id}_${VALUE_KEY}`] = applyAggregation(
                    settings.aggregation?.[VALUE_KEY] ?? DEFAULT_AGGREGATION,
                    values
                )

                const legends = matches
                    .map((p) => p[LEGEND_KEY])
                    .filter((v) => v != null)
                row[`${layer.id}_${LEGEND_KEY}`] =
                    legends.length && legends.every((l) => l === legends[0])
                        ? legends[0]
                        : null

                const ids = matches.map((p) => p.id).filter((id) => id != null)
                if (ids.length) {
                    featureIds[layer.id] = ids
                }
            })

            rowFeatureIds.set(refProps.id, featureIds)
            return row
        })

        const rows = finalizeRows(flatRows, headers, {
            filters,
            globalSearch,
            sortField,
            sortDirection,
        })
        const columnOptions =
            sortColumnOptions(getColumnDistinctValues(headers, flatRows), {
                sortField,
                sortDirection,
            }) ?? EMPTY_COLUMN_OPTIONS

        return {
            headers,
            rows,
            rowFeatureIds,
            columnOptions,
            spatialWarning,
        }
    }, [
        referenceOrgUnits,
        referenceLayer,
        layerMatches,
        filters,
        globalSearch,
        sortField,
        sortDirection,
    ])
}
