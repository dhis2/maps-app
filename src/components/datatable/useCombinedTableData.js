import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import {
    ORG_UNIT_LEVEL_DATA_KEY,
    SORT_ASCENDING,
    TYPE_NUMBER,
    TYPE_STRING,
} from '../../constants/dataTable.js'
import { EARTH_ENGINE_LAYER } from '../../constants/layers.js'
import {
    SELECTION_FILTER_SELECTED,
    SELECTION_FILTER_NOT_SELECTED,
} from '../../constants/selection.js'
import { applyAggregation } from '../../util/aggregation.js'
import {
    getByReferenceId,
    getJoinableFeatures,
    getProps,
} from '../../util/combinedJoinMatch.js'
import {
    getCombinedValueDataKeys,
    getDefaultCombinedAggregation,
} from '../../util/dataTable.js'
import { filterByGlobalSearch, filterData } from '../../util/filter.js'
import { isFeatureInBounds } from '../../util/geojson.js'
import {
    buildRowCells,
    getColumnDistinctValues,
    sortColumnOptions,
} from '../../util/tableColumns.js'
import { compareRows } from '../../util/tableSort.js'

const LEGEND_KEY = 'legend'
const LARGE_FEATURE_THRESHOLD = 10000
const EMPTY_AGGREGATIONS = {}

const mergeAggregations = (layer, aggregationsForLayer) => {
    if (layer.layer !== EARTH_ENGINE_LAYER || !aggregationsForLayer) {
        return layer
    }
    const mergeFeature = (feature) => ({
        ...feature,
        properties: {
            ...getProps(feature),
            ...aggregationsForLayer[feature.id ?? getProps(feature).id],
        },
    })
    return {
        ...layer,
        data: layer.data?.map(mergeFeature),
        dataWithoutCoords: layer.dataWithoutCoords?.map(mergeFeature),
    }
}

const finalizeRows = (
    flatRows,
    headers,
    {
        filters,
        globalSearch,
        sortField,
        sortDirection,
        selectionFilter,
        selectedIdSet,
    }
) => {
    let data = filterData(flatRows, filters)

    if (globalSearch?.trim()) {
        const stringDataKeys = headers
            .filter((h) => h.type === TYPE_STRING)
            .map((h) => h.dataKey)
        data = filterByGlobalSearch(data, globalSearch, { stringDataKeys })
    }

    if (selectionFilter?.length) {
        const wantSelected = selectionFilter.includes(SELECTION_FILTER_SELECTED)
        const wantNotSelected = selectionFilter.includes(
            SELECTION_FILTER_NOT_SELECTED
        )
        if (wantSelected !== wantNotSelected) {
            data = data.filter(
                (item) => !!selectedIdSet?.has(item.id) === wantSelected
            )
        }
    }

    data = [...data].sort((a, b) =>
        compareRows(a, b, { sortField, sortDirection })
    )

    return data.map((row) => buildRowCells(row, headers))
}

const applyLayerMatchToRow = ({ row, featureIds, refProps }, layerMatch) => {
    const { layer, settings, byReferenceId, valueDataKeys } = layerMatch
    const matches = byReferenceId.get(refProps.id) ?? []

    valueDataKeys.forEach(({ dataKey }) => {
        const values = matches.map((p) => p[dataKey]).filter((v) => v != null)
        row[`${layer.combinedLayerKey}_${dataKey}`] = applyAggregation(
            settings.aggregation?.[dataKey] ??
                getDefaultCombinedAggregation(layer)[dataKey],
            values
        )
    })

    if (layer.layer !== EARTH_ENGINE_LAYER) {
        const legends = matches
            .map((p) => p[LEGEND_KEY])
            .filter((v) => v != null)
        row[`${layer.combinedLayerKey}_${LEGEND_KEY}`] =
            legends.length && legends.every((l) => l === legends[0])
                ? legends[0]
                : null
    }

    const ids = matches.map((p) => p.id).filter((id) => id != null)
    if (ids.length) {
        featureIds[layer.id] = ids
    }
}

const EMPTY_COLUMN_OPTIONS = {}
const EMPTY_HEADERS = []

const EMPTY_RESULT = {
    headers: EMPTY_HEADERS,
    rows: [],
    rowFeatureIds: new Map(),
    columnOptions: EMPTY_COLUMN_OPTIONS,
    spatialWarning: false,
}

export const useCombinedTableData = ({
    layers,
    referenceLayer,
    joinConfig,
    sortField = null,
    sortDirection = SORT_ASCENDING,
    filters,
    globalSearch,
    aggregations: allAggregations = EMPTY_AGGREGATIONS,
    showOnlyFeaturesInView = false,
    mapBounds,
    selectionFilter,
    selectedIdSet,
}) => {
    const referenceOrgUnits = useMemo(
        () => getJoinableFeatures(referenceLayer),
        [referenceLayer]
    )

    const visibleReferenceOrgUnits = useMemo(
        () =>
            showOnlyFeaturesInView && mapBounds
                ? referenceOrgUnits.filter((f) =>
                      isFeatureInBounds(f, mapBounds)
                  )
                : referenceOrgUnits,
        [referenceOrgUnits, showOnlyFeaturesInView, mapBounds]
    )

    const layerMatches = useMemo(
        () =>
            layers.map((layer) => {
                const settings = joinConfig.layers[layer.combinedLayerKey] ?? {
                    type: 'orgUnit',
                    aggregation: {},
                }
                const mergedLayer = mergeAggregations(
                    layer,
                    allAggregations[layer.id] ?? EMPTY_AGGREGATIONS
                )
                const features = getJoinableFeatures(mergedLayer)
                const valueDataKeys = getCombinedValueDataKeys(layer)
                const byReferenceId = getByReferenceId(
                    features,
                    referenceOrgUnits,
                    settings.type
                )
                return { layer, settings, byReferenceId, valueDataKeys }
            }),
        [layers, joinConfig, referenceOrgUnits, allAggregations]
    )

    const headers = useMemo(() => {
        if (!referenceOrgUnits.length) {
            return EMPTY_HEADERS
        }
        return [
            {
                name: i18n.t('Org unit id'),
                dataKey: 'id',
                type: TYPE_STRING,
                defaultHidden: true,
            },
            { name: i18n.t('Org unit'), dataKey: 'name', type: TYPE_STRING },
            {
                name: i18n.t('Org unit level'),
                dataKey: 'level',
                type: TYPE_NUMBER,
                defaultHidden: true,
            },
            ...layerMatches.flatMap(({ layer, valueDataKeys }) => [
                ...valueDataKeys.map(({ dataKey, name }) => ({
                    name: name
                        ? i18n.t('{{name}} ({{layer}})', {
                              name,
                              layer: layer.name,
                          })
                        : i18n.t('Value ({{layer}})', { layer: layer.name }),
                    dataKey: `${layer.combinedLayerKey}_${dataKey}`,
                    type: TYPE_NUMBER,
                })),
                // Earth Engine has no separate categorical "legend" concept
                ...(layer.layer !== EARTH_ENGINE_LAYER
                    ? [
                          {
                              name: i18n.t('Legend ({{layer}})', {
                                  layer: layer.name,
                              }),
                              dataKey: `${layer.combinedLayerKey}_${LEGEND_KEY}`,
                              type: TYPE_STRING,
                          },
                      ]
                    : []),
            ]),
        ]
    }, [referenceOrgUnits, layerMatches])

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

        const rowFeatureIds = new Map()

        const flatRows = visibleReferenceOrgUnits.map(
            (referenceFeature, index) => {
                const refProps = getProps(referenceFeature)
                const row = {
                    id: refProps.id,
                    name: refProps.name ?? null,
                    level: refProps[ORG_UNIT_LEVEL_DATA_KEY] ?? null,
                    index,
                }

                const featureIds = { [referenceLayer.id]: [refProps.id] }

                layerMatches.forEach((layerMatch) =>
                    applyLayerMatchToRow(
                        { row, featureIds, refProps },
                        layerMatch
                    )
                )

                rowFeatureIds.set(refProps.id, featureIds)
                return row
            }
        )

        const rows = finalizeRows(flatRows, headers, {
            filters,
            globalSearch,
            sortField,
            sortDirection,
            selectionFilter,
            selectedIdSet,
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
        visibleReferenceOrgUnits,
        referenceLayer,
        layerMatches,
        headers,
        filters,
        globalSearch,
        sortField,
        sortDirection,
        selectionFilter,
        selectedIdSet,
    ])
}
