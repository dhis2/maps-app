import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import {
    DATA_KEY_KIND_CATEGORY,
    DATA_KEY_KIND_COUNT,
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
    CATEGORY_DISPLAY_TYPE_KEY,
    getCombinedLegendConfig,
    getCombinedValueDataKeys,
    getDefaultCombinedAggregation,
    getFeatureCategoryKey,
} from '../../util/dataTable.js'
import { filterByGlobalSearch, filterData } from '../../util/filter.js'
import { isFeatureInBounds } from '../../util/geojson.js'
import { getRoundToPrecisionFn } from '../../util/numbers.js'
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
        keyAnalysisDigitGroupSeparator,
    }
) => {
    let data = filterData(flatRows, filters)

    if (globalSearch?.trim()) {
        data = filterByGlobalSearch(data, globalSearch, {
            headers,
            keyAnalysisDigitGroupSeparator,
        })
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
    const { layer, settings, byReferenceId, valueDataKeys, legendConfig } =
        layerMatch
    const matches = byReferenceId.get(refProps.id) ?? []

    valueDataKeys.forEach(({ dataKey, kind, periodId, settingsKey }) => {
        const rowKey = `${layer.combinedLayerKey}_${dataKey}`

        if (kind === DATA_KEY_KIND_COUNT) {
            row[rowKey] = matches.length || null
            return
        }

        if (kind === DATA_KEY_KIND_CATEGORY) {
            if (!matches.length) {
                row[rowKey] = null
                return
            }
            const displayType =
                settings.aggregation?.[CATEGORY_DISPLAY_TYPE_KEY] ??
                getDefaultCombinedAggregation(layer)[CATEGORY_DISPLAY_TYPE_KEY]
            const inCategory = matches.filter(
                (p) => getFeatureCategoryKey(layer, p) === dataKey
            ).length
            row[rowKey] =
                displayType === 'PERCENTAGE'
                    ? (inCategory / matches.length) * 100
                    : inCategory
            return
        }

        const effectiveType =
            settings.aggregation?.[settingsKey ?? dataKey] ??
            getDefaultCombinedAggregation(layer)[dataKey]
        const values =
            periodId != null
                ? matches
                      .map(
                          (p) => layer.valuesByPeriod?.[periodId]?.[p.id]?.value
                      )
                      .filter((v) => Number.isFinite(v))
                : matches
                      .map((p) => p[dataKey])
                      .filter((v) => Number.isFinite(v))
        row[rowKey] = applyAggregation(effectiveType, values)
    })

    if (legendConfig) {
        const legends = matches
            .map((p) =>
                legendConfig.periodId != null
                    ? layer.valuesByPeriod?.[legendConfig.periodId]?.[p.id]
                          ?.legend
                    : p[LEGEND_KEY]
            )
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

const getValueDataKeyHeader = (
    layer,
    settings,
    { dataKey, name, kind, defaultHidden, periodName, isCurrentPeriod }
) => {
    const rowKey = `${layer.combinedLayerKey}_${dataKey}`

    if (kind === DATA_KEY_KIND_COUNT) {
        return {
            name: i18n.t('Count ({{layer}})', { layer: layer.name }),
            dataKey: rowKey,
            type: TYPE_NUMBER,
            defaultHidden,
        }
    }

    if (kind === DATA_KEY_KIND_CATEGORY) {
        const displayType =
            settings.aggregation?.[CATEGORY_DISPLAY_TYPE_KEY] ??
            getDefaultCombinedAggregation(layer)[CATEGORY_DISPLAY_TYPE_KEY]
        const isPercentage = displayType === 'PERCENTAGE'
        return {
            name: i18n.t('{{name}} ({{unit}}) ({{layer}})', {
                name,
                unit: isPercentage ? i18n.t('%') : i18n.t('count'),
                layer: layer.name,
            }),
            dataKey: rowKey,
            type: TYPE_NUMBER,
            defaultHidden,
            ...(isPercentage ? { roundFn: getRoundToPrecisionFn(1) } : {}),
        }
    }

    if (periodName !== undefined || isCurrentPeriod) {
        return {
            name: i18n.t('Value ({{layer}}, {{period}})', {
                layer: layer.name,
                period: periodName ?? i18n.t('Current period'),
            }),
            dataKey: rowKey,
            type: TYPE_NUMBER,
            defaultHidden,
            ...(isCurrentPeriod && {
                configName: i18n.t('Value ({{layer}}, {{period}})', {
                    layer: layer.name,
                    period: i18n.t('Current period'),
                }),
            }),
        }
    }

    return {
        name: name
            ? i18n.t('{{name}} ({{layer}})', { name, layer: layer.name })
            : i18n.t('Value ({{layer}})', { layer: layer.name }),
        dataKey: rowKey,
        type: TYPE_NUMBER,
        defaultHidden,
    }
}

const getLegendHeader = (layer, { periodName, isCurrentPeriod }) => {
    const dataKey = `${layer.combinedLayerKey}_${LEGEND_KEY}`
    if (!isCurrentPeriod) {
        return {
            name: i18n.t('Legend ({{layer}})', { layer: layer.name }),
            dataKey,
            type: TYPE_STRING,
            defaultHidden: true,
        }
    }
    return {
        name: i18n.t('Legend ({{layer}}, {{period}})', {
            layer: layer.name,
            period: periodName ?? i18n.t('Current period'),
        }),
        configName: i18n.t('Legend ({{layer}}, {{period}})', {
            layer: layer.name,
            period: i18n.t('Current period'),
        }),
        dataKey,
        type: TYPE_STRING,
        defaultHidden: true,
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
    keyAnalysisDigitGroupSeparator,
    externalPeriod,
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
                const valueDataKeys = getCombinedValueDataKeys(
                    layer,
                    externalPeriod
                )
                const legendConfig = getCombinedLegendConfig(
                    layer,
                    externalPeriod
                )
                const byReferenceId = getByReferenceId(
                    features,
                    referenceOrgUnits,
                    settings.type
                )
                return {
                    layer,
                    settings,
                    byReferenceId,
                    valueDataKeys,
                    legendConfig,
                }
            }),
        [layers, joinConfig, referenceOrgUnits, allAggregations, externalPeriod]
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
            ...layerMatches.flatMap(
                ({ layer, settings, valueDataKeys, legendConfig }) => [
                    ...valueDataKeys.map((valueDataKey) =>
                        getValueDataKeyHeader(layer, settings, valueDataKey)
                    ),
                    ...(legendConfig
                        ? [getLegendHeader(layer, legendConfig)]
                        : []),
                ]
            ),
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
            keyAnalysisDigitGroupSeparator,
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
        keyAnalysisDigitGroupSeparator,
    ])
}
