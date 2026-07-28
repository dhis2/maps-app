import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import {
    ORG_UNIT_ID_DATA_KEY,
    ORG_UNIT_PATH_DATA_KEY,
    ORG_UNIT_DATA_KEY,
    ORG_UNIT_LEVEL_DATA_KEY,
    TYPE_NUMBER,
    TYPE_STRING,
} from '../../constants/dataTable.js'
import useOrgUnitAncestorNames from '../../hooks/useOrgUnitAncestorNames.js'
import { spatialJoin } from '../../util/spatialJoin.js'

const VALUE_KEY = 'rawValue'
const LEGEND_KEY = 'legend'
const LARGE_FEATURE_THRESHOLD = 10000
const NO_PARENT_KEY = '__no_parent__'

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

const EMPTY_RESULT = { headers: [], rows: [], spatialWarning: false }

export const useCombinedTableData = ({ layers, joinConfig }) => {
    const { level, pointLayerId, polygonLayerId } = joinConfig
    const isSpatial = level === 'spatial'
    const isParentGrouped = level === 'parentOrgUnit'

    const layerMaps = useMemo(() => {
        if (isSpatial) {
            return []
        }
        return layers.map((layer) => ({
            layer,
            byOrgUnit: Object.fromEntries(
                (layer.data ?? [])
                    .filter((d) => !d.properties?.hasAdditionalGeometry)
                    .map((d) => {
                        const props = d.properties || d
                        return [props[ORG_UNIT_ID_DATA_KEY], props]
                    })
                    .filter(([id]) => id != null)
            ),
        }))
    }, [layers, isSpatial])

    const allIds = useMemo(
        () => [
            ...new Set(layerMaps.flatMap((lm) => Object.keys(lm.byOrgUnit))),
        ],
        [layerMaps]
    )

    const parentPaths = useMemo(() => {
        if (!isParentGrouped) {
            return []
        }
        const paths = new Set()
        allIds.forEach((id) => {
            const baseProps = layerMaps.find((lm) => lm.byOrgUnit[id])
                ?.byOrgUnit[id]
            const parentPath = getParentPath(
                baseProps?.[ORG_UNIT_PATH_DATA_KEY]
            )
            if (parentPath) {
                paths.add(parentPath)
            }
        })
        return [...paths]
    }, [layerMaps, allIds, isParentGrouped])

    const { idToName: parentIdToName } = useOrgUnitAncestorNames(parentPaths)

    return useMemo(() => {
        if (!layers?.length) {
            return EMPTY_RESULT
        }

        if (isSpatial) {
            const pointLayer = layers.find((l) => l.id === pointLayerId)
            const polygonLayer = layers.find((l) => l.id === polygonLayerId)
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

            const rows = joined.map(({ pointProps, polygonProps }) => [
                { dataKey: 'id', value: pointProps.id ?? null, align: 'left' },
                {
                    dataKey: 'name',
                    value:
                        pointProps[ORG_UNIT_DATA_KEY] ??
                        pointProps.name ??
                        pointProps.id ??
                        null,
                    align: 'left',
                },
                {
                    dataKey: `${polygonLayer.id}_${VALUE_KEY}`,
                    value: polygonProps?.[VALUE_KEY] ?? null,
                    align: 'right',
                },
                {
                    dataKey: `${polygonLayer.id}_${LEGEND_KEY}`,
                    value: polygonProps?.[LEGEND_KEY] ?? null,
                    align: 'left',
                },
            ])

            return { headers, rows, spatialWarning }
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
                            ? parentIdToName.get(parentId) ?? parentId
                            : i18n.t('No parent'),
                        memberIds: [],
                    })
                }
                groups.get(key).memberIds.push(id)
            })

            const rows = [...groups.values()].map((group) => {
                const cells = [
                    { dataKey: 'id', value: group.id, align: 'left' },
                    { dataKey: 'name', value: group.name, align: 'left' },
                ]
                layerMaps.forEach(({ layer, byOrgUnit }) => {
                    const values = group.memberIds
                        .map((id) => byOrgUnit[id]?.[VALUE_KEY])
                        .filter((v) => v != null)
                    const average = values.length
                        ? values.reduce((a, b) => a + b, 0) / values.length
                        : null
                    cells.push({
                        dataKey: `${layer.id}_${VALUE_KEY}`,
                        value: average,
                        align: 'right',
                    })
                    cells.push({
                        dataKey: `${layer.id}_${LEGEND_KEY}`,
                        value: null,
                        align: 'left',
                    })
                })
                return cells
            })

            return { headers, rows, spatialWarning: false }
        }

        const headers = [
            { name: i18n.t('ID'), dataKey: 'id', type: TYPE_STRING },
            { name: i18n.t('Name'), dataKey: 'name', type: TYPE_STRING },
            { name: i18n.t('Level'), dataKey: 'level', type: TYPE_NUMBER },
            ...layerHeaders,
        ]

        const rows = allIds.map((id) => {
            const baseProps =
                layerMaps.find((lm) => lm.byOrgUnit[id])?.byOrgUnit[id] ?? {}
            const cells = [
                { dataKey: 'id', value: id, align: 'left' },
                {
                    dataKey: 'name',
                    value: baseProps[ORG_UNIT_DATA_KEY] ?? null,
                    align: 'left',
                },
                {
                    dataKey: 'level',
                    value: baseProps[ORG_UNIT_LEVEL_DATA_KEY] ?? null,
                    align: 'right',
                },
            ]
            layerMaps.forEach(({ layer, byOrgUnit }) => {
                const props = byOrgUnit[id]
                cells.push({
                    dataKey: `${layer.id}_${VALUE_KEY}`,
                    value: props?.[VALUE_KEY] ?? null,
                    align: 'right',
                })
                cells.push({
                    dataKey: `${layer.id}_${LEGEND_KEY}`,
                    value: props?.[LEGEND_KEY] ?? null,
                    align: 'left',
                })
            })
            return cells
        })

        return { headers, rows, spatialWarning: false }
    }, [
        layers,
        layerMaps,
        allIds,
        isSpatial,
        isParentGrouped,
        pointLayerId,
        polygonLayerId,
        parentIdToName,
    ])
}
