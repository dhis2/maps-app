import { getRelativePeriodsName } from '@dhis2/analytics'
import {
    setClassification,
    setLegendSet,
    setOrgUnits,
    setPeriods,
    setBackupPeriodsDates,
    setPeriodType,
    setRenderingStrategy,
    setValueType,
} from '../../../actions/layerEdit.js'
import { dimConf } from '../../../constants/dimension.js'
import {
    DEFAULT_ORG_UNIT_LEVEL,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
} from '../../../constants/layers.js'
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import { getDefaultDatesInCalendar } from '../../../util/date.js'
import { isPeriodAvailable } from '../../../util/periods.js'

export const initializeThematicLayer =
    ({
        valueType,
        dataItem,
        renderingStrategy,
        defaultRenderingStrategy,
        periodType,
        startDate,
        endDate,
        filters,
        rows,
        orgUnits,
        method,
        systemSettings,
        syncFromOtherLayers,
    }) =>
    (dispatch) => {
        // Data
        // -----

        // Initialize value type
        if (!valueType) {
            if (dataItem?.dimensionItemType) {
                const dimension = Object.keys(dimConf).find(
                    (dim) =>
                        dimConf[dim].itemType === dataItem.dimensionItemType
                )
                if (dimension) {
                    dispatch(setValueType(dimConf[dimension].objectName, true))
                }
            } else {
                dispatch(setValueType(dimConf.indicator.objectName))
            }
        }

        // Period
        // -----

        // Initialize rendering strategy
        if (!renderingStrategy) {
            dispatch(setRenderingStrategy(defaultRenderingStrategy))
        }

        // Initialize period type
        if (!periodType) {
            const hasDate = startDate !== undefined && endDate !== undefined
            if (hasDate) {
                dispatch(setPeriodType({ value: START_END_DATES }, false))
            } else {
                dispatch(setPeriodType({ value: PREDEFINED_PERIODS }, true))
            }
        }

        // Initialize periods
        if (!filters) {
            const hasDate = startDate !== undefined && endDate !== undefined
            if (!hasDate) {
                const {
                    keyAnalysisRelativePeriod: defaultPeriod,
                    hiddenPeriods,
                } = systemSettings || {}

                let defaultPeriods
                if (isPeriodAvailable(defaultPeriod, hiddenPeriods)) {
                    defaultPeriods = [
                        {
                            id: defaultPeriod,
                            name: getRelativePeriodsName()[defaultPeriod],
                        },
                    ]
                }

                if (
                    syncFromOtherLayers({
                        renderingStrategy:
                            renderingStrategy || defaultRenderingStrategy,
                    })
                ) {
                    dispatch(
                        setBackupPeriodsDates({
                            type: PREDEFINED_PERIODS,
                            periods: defaultPeriods || [],
                            ...getDefaultDatesInCalendar(),
                        })
                    )
                } else {
                    dispatch(
                        setBackupPeriodsDates({
                            type: START_END_DATES,
                            ...getDefaultDatesInCalendar(),
                        })
                    )
                    dispatch(setPeriods(defaultPeriods || []))
                }
            }
        }

        // OrgUnits
        // -----

        // Initialize org unit level
        if (!rows) {
            const defaultLevel = orgUnits?.levels?.[DEFAULT_ORG_UNIT_LEVEL]
            if (defaultLevel) {
                dispatch(
                    setOrgUnits({
                        dimension: 'ou',
                        items: [
                            {
                                id: `LEVEL-${defaultLevel.id}`,
                                name: defaultLevel.name,
                            },
                        ],
                    })
                )
            }
        }

        // Style
        // -----

        // Set initial classification and legend
        if (!method && dataItem) {
            if (dataItem.legendSet) {
                dispatch(setClassification(CLASSIFICATION_PREDEFINED))
                dispatch(setLegendSet(dataItem.legendSet))
            } else {
                dispatch(setClassification(CLASSIFICATION_EQUAL_INTERVALS))
                dispatch(setLegendSet())
            }
        }
    }
