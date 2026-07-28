import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import {
    ORG_UNIT_ID_DATA_KEY,
    ORG_UNIT_PATH_DATA_KEY,
    ORG_UNIT_LEVEL_DATA_KEY,
    SORT_ASCENDING,
    TYPE_NUMBER,
    TYPE_STRING,
} from '../../constants/dataTable.js'
import useOrgUnitAncestorNames from '../../hooks/useOrgUnitAncestorNames.js'
import { filterByGlobalSearch, filterData } from '../../util/filter.js'
import { formatOrgUnitOwnName } from '../../util/orgUnitGroups.js'
import { spatialJoin } from '../../util/spatialJoin.js'
import {
    buildRowCells,
    getColumnDistinctValues,
    sortColumnOptions,
} from '../../util/tableColumns.js'
import { compareRows } from '../../util/tableSort.js'

const VALUE_KEY = 'rawValue'
const LEGEND_KEY = 'legend'
const LARGE_FEATURE_THRESHOLD = 10000
const NO_PARENT_KEY = '__no_parent__'

// Shared by all three join modes: apply Combined's own local filters/global
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

const getPathSegments = (path) =>
    path ? String(path).split('/').filter(Boolean) : []

const getLastSegment = (path) => {
    const segments = getPathSegments(path)
    return segments.length ? segments[segments.length - 1] : null
}

const getParentPath = (path) => {
    const segments = getPathSegments(path)
    return segments.length > 1 ? segments.slice(0, -1).join('/') : null
}

const EMPTY_COLUMN_OPTIONS = {}

const EMPTY_RESULT = {
    headers: [],
    rows: [],
    rowFeatureIds: new Map(),
    columnOptions: EMPTY_COLUMN_OPTIONS,
    spatialWarning: false,
}

export const useCombinedTableData = ({
    layers,
    joinConfig,
    sortField = null,
    sortDirection = SORT_ASCENDING,
    filters,
    globalSearch,
}) => {
    const { level, pointLayerId, polygonLayerId } = joinConfig
    const isSpatial = level === 'spatial'
    const isParentGrouped = level === 'parentOrgUnit'

    const pointLayer = isSpatial
        ? layers.find((l) => l.id === pointLayerId)
        : null
    const polygonLayer = isSpatial
        ? layers.find((l) => l.id === polygonLayerId)
        : null

    const layerMaps = useMemo(() => {
        if (isSpatial) {
            return []
        }
        return layers.map((layer) => {
            const byOrgUnit = {}
            // Duplicate features can share one org unit (e.g. several events
            // at the same facility) - byOrgUnit keeps only the last one for
            // display purposes, but featureIdsByOrgUnit keeps every matching
            // feature id so hover/selection can highlight all of them, not
            // just the one whose value happens to be shown.
            const featureIdsByOrgUnit = {}

            const data = layer.data ?? []
            data.filter((d) => !d.properties?.hasAdditionalGeometry).forEach(
                (d) => {
                    const props = d.properties || d
                    // orgUnitId is only populated for layers where the
                    // feature references an org unit it isn't itself
                    // (events, tracked entities - via attachOrgUnitPaths
                    // in util/orgUnits.js). For layers where the feature
                    // IS the org unit (thematic, org unit, facility),
                    // properties are built by toGeoJson() in
                    // util/map.js, which never sets orgUnitId - the org
                    // unit's own id is just the feature's plain id there.
                    const orgUnitId = props[ORG_UNIT_ID_DATA_KEY] ?? props.id
                    if (orgUnitId == null) {
                        return
                    }
                    byOrgUnit[orgUnitId] = props
                    if (!featureIdsByOrgUnit[orgUnitId]) {
                        featureIdsByOrgUnit[orgUnitId] = []
                    }
                    featureIdsByOrgUnit[orgUnitId].push(props.id)
                }
            )

            return { layer, byOrgUnit, featureIdsByOrgUnit }
        })
    }, [layers, isSpatial])

    const allIds = useMemo(
        () => [
            ...new Set(layerMaps.flatMap((lm) => Object.keys(lm.byOrgUnit))),
        ],
        [layerMaps]
    )

    // useOrgUnitAncestorNames resolves every id along each path it's given
    // (not just the leaf), so passing each matched org unit's own full path
    // also resolves its parent's name for free in parentOrgUnit mode - no
    // need for a separate parent-path-only list.
    const orgUnitPaths = useMemo(() => {
        if (isSpatial) {
            return (pointLayer?.data ?? [])
                .map((d) => (d.properties || d)[ORG_UNIT_PATH_DATA_KEY])
                .filter(Boolean)
        }
        return allIds
            .map(
                (id) =>
                    layerMaps.find((lm) => lm.byOrgUnit[id])?.byOrgUnit[id]?.[
                        ORG_UNIT_PATH_DATA_KEY
                    ]
            )
            .filter(Boolean)
    }, [isSpatial, pointLayer, layerMaps, allIds])

    const { idToName } = useOrgUnitAncestorNames(orgUnitPaths)

    return useMemo(() => {
        if (!layers?.length) {
            return EMPTY_RESULT
        }

        if (isSpatial) {
            if (!pointLayer || !polygonLayer) {
                return EMPTY_RESULT
            }

            const spatialWarning =
                (pointLayer.data?.length ?? 0) > LARGE_FEATURE_THRESHOLD ||
                (polygonLayer.data?.length ?? 0) > LARGE_FEATURE_THRESHOLD

            const joined = spatialJoin(pointLayer, polygonLayer)

            const headers = [
                { name: i18n.t('ID'), dataKey: 'id', type: TYPE_STRING },
                { name: i18n.t('Name'), dataKey: 'name', type: TYPE_STRING },
                {
                    name: i18n.t('Value ({{layer}})', {
                        layer: polygonLayer.name,
                    }),
                    dataKey: `${polygonLayer.id}_${VALUE_KEY}`,
                    type: TYPE_NUMBER,
                },
                {
                    name: i18n.t('Legend ({{layer}})', {
                        layer: polygonLayer.name,
                    }),
                    dataKey: `${polygonLayer.id}_${LEGEND_KEY}`,
                    type: TYPE_STRING,
                },
            ]

            const rowFeatureIds = new Map()

            const flatRows = joined.map(
                ({ pointProps, polygonProps }, index) => {
                    const path = pointProps[ORG_UNIT_PATH_DATA_KEY]

                    if (pointProps.id != null) {
                        const entry = { [pointLayer.id]: [pointProps.id] }
                        if (polygonProps?.id != null) {
                            entry[polygonLayer.id] = [polygonProps.id]
                        }
                        rowFeatureIds.set(pointProps.id, entry)
                    }

                    return {
                        id: pointProps.id ?? null,
                        name: path
                            ? formatOrgUnitOwnName(path, idToName)
                            : pointProps.name ?? pointProps.id ?? null,
                        [`${polygonLayer.id}_${VALUE_KEY}`]:
                            polygonProps?.[VALUE_KEY] ?? null,
                        [`${polygonLayer.id}_${LEGEND_KEY}`]:
                            polygonProps?.[LEGEND_KEY] ?? null,
                        index,
                    }
                }
            )

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
        }

        const layerHeaders = layerMaps.flatMap(({ layer }) => [
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
        ])

        if (isParentGrouped) {
            const headers = [
                { name: i18n.t('ID'), dataKey: 'id', type: TYPE_STRING },
                { name: i18n.t('Name'), dataKey: 'name', type: TYPE_STRING },
                ...layerHeaders,
            ]

            const groups = new Map()
            allIds.forEach((id) => {
                const baseProps = layerMaps.find((lm) => lm.byOrgUnit[id])
                    ?.byOrgUnit[id]
                const parentPath = getParentPath(
                    baseProps?.[ORG_UNIT_PATH_DATA_KEY]
                )
                const parentId = getLastSegment(parentPath)
                const key = parentId ?? NO_PARENT_KEY
                if (!groups.has(key)) {
                    groups.set(key, {
                        id: parentId,
                        name: parentId
                            ? idToName.get(parentId) ?? parentId
                            : i18n.t('No parent'),
                        memberIds: [],
                    })
                }
                groups.get(key).memberIds.push(id)
            })

            const rowFeatureIds = new Map()

            const flatRows = [...groups.values()].map((group, index) => {
                const row = { id: group.id, name: group.name, index }
                const featureIds = {}
                layerMaps.forEach(
                    ({ layer, byOrgUnit, featureIdsByOrgUnit }) => {
                        const values = group.memberIds
                            .map((id) => byOrgUnit[id]?.[VALUE_KEY])
                            .filter((v) => v != null)
                        const average = values.length
                            ? values.reduce((a, b) => a + b, 0) / values.length
                            : null
                        row[`${layer.id}_${VALUE_KEY}`] = average
                        row[`${layer.id}_${LEGEND_KEY}`] = null

                        const ids = group.memberIds.flatMap(
                            (id) => featureIdsByOrgUnit[id] ?? []
                        )
                        if (ids.length) {
                            featureIds[layer.id] = ids
                        }
                    }
                )
                rowFeatureIds.set(group.id, featureIds)
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
                spatialWarning: false,
            }
        }

        const headers = [
            { name: i18n.t('ID'), dataKey: 'id', type: TYPE_STRING },
            { name: i18n.t('Name'), dataKey: 'name', type: TYPE_STRING },
            { name: i18n.t('Level'), dataKey: 'level', type: TYPE_NUMBER },
            ...layerHeaders,
        ]

        const rowFeatureIds = new Map()

        const flatRows = allIds.map((id, index) => {
            const baseProps =
                layerMaps.find((lm) => lm.byOrgUnit[id])?.byOrgUnit[id] ?? {}
            const path = baseProps[ORG_UNIT_PATH_DATA_KEY]
            const row = {
                id,
                name: path ? formatOrgUnitOwnName(path, idToName) : null,
                level: baseProps[ORG_UNIT_LEVEL_DATA_KEY] ?? null,
                index,
            }
            const featureIds = {}
            layerMaps.forEach(({ layer, byOrgUnit, featureIdsByOrgUnit }) => {
                const props = byOrgUnit[id]
                row[`${layer.id}_${VALUE_KEY}`] = props?.[VALUE_KEY] ?? null
                row[`${layer.id}_${LEGEND_KEY}`] = props?.[LEGEND_KEY] ?? null

                if (featureIdsByOrgUnit[id]?.length) {
                    featureIds[layer.id] = featureIdsByOrgUnit[id]
                }
            })
            rowFeatureIds.set(id, featureIds)
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
            spatialWarning: false,
        }
    }, [
        layers,
        layerMaps,
        allIds,
        isSpatial,
        isParentGrouped,
        pointLayer,
        polygonLayer,
        idToName,
        filters,
        globalSearch,
        sortField,
        sortDirection,
    ])
}
