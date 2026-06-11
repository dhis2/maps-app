import { DataDimension, PeriodDimension } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { SegmentedControl, IconErrorFilled24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    setClassification,
    setDataItem,
    setLegendSet,
    setNoDataLegend,
    setUnclassifiedLegend,
    setCountFeaturesWithoutCoordinates,
    setPeriods,
    setStartDate,
    setEndDate,
    setBackupPeriodsDates,
    setPeriodType,
    setRenderingStrategy,
} from '../../../actions/layerEdit.js'
import {
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../../constants/layers.js'
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import useDataItemLegendSet from '../../../hooks/useDataItemLegendSet.js'
import useLayersPeriodSync from '../../../hooks/useLayersPeriodSync.js'
import usePrevious from '../../../hooks/usePrevious.js'
import {
    getDataItemFromColumns,
    getPeriodsFromFilters,
    getDimensionsFromFilters,
} from '../../../util/analytics.js'
import NumericLegendStyle from '../../classification/NumericLegendStyle.jsx'
import { Tab, Tabs, Checkbox } from '../../core/index.js'
import DimensionFilter from '../../dimensions/DimensionFilter.jsx'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.jsx'
import RenderingStrategy from '../../periods/RenderingStrategy.jsx'
import StartEndDate from '../../periods/StartEndDate.jsx'
import Labels from '../shared/Labels.jsx'
import NoDataLegend from '../shared/NoDataLegend.jsx'
import UnclassifiedLegend from '../shared/UnclassifiedLegend.jsx'
import styles from '../styles/LayerDialog.module.css'
import AggregationTypeSelect from './AggregationTypeSelect.jsx'
import CompletedOnlyCheckbox from './CompletedOnlyCheckbox.jsx'
import { initializeThematicLayer } from './initializeThematicLayer.js'
import RadiusSelect from './RadiusSelect.jsx'
import ThematicMapTypeSelect from './ThematicMapTypeSelect.jsx'
import { validateThematicLayer } from './validateThematicLayer.js'

const ThematicDialog = ({
    columns,
    rows,
    filters,
    orgUnits,
    eventStatus,
    startDate,
    endDate,
    backupPeriodsDates,
    systemSettings,
    periodType,
    renderingStrategy,
    id,
    noDataLegend,
    unclassifiedLegend,
    periodsSettings,
    currentUser,
    validateLayer,
    onLayerValidation,
    legendSet,
    radiusLow,
    radiusHigh,
    method,
    thematicMapType,
    legendIsolated,
}) => {
    const dispatch = useDispatch()
    const countFeaturesWithoutCoordinates = useSelector(
        (state) => state.layerEdit.countFeaturesWithoutCoordinates
    )
    const {
        defaultRenderingStrategy,
        shouldSyncFromOtherLayers,
        syncFromOtherLayers,
        syncToOtherLayers,
    } = useLayersPeriodSync()
    const fetchLegendSet = useDataItemLegendSet()

    // State management
    // -----

    const [tab, setTab] = useState('data')
    const [errors, setErrors] = useState({})

    const prevFilters = usePrevious(filters)
    const prevRenderingStrategy = usePrevious(renderingStrategy)
    const prevPeriodType = usePrevious(periodType)
    const prevStartDate = usePrevious(startDate)
    const prevEndDate = usePrevious(endDate)
    const prevValidateLayer = usePrevious(validateLayer)

    const dataItem = useMemo(() => getDataItemFromColumns(columns), [columns])
    const periods = useMemo(() => getPeriodsFromFilters(filters), [filters])
    const dimensions = useMemo(
        () => getDimensionsFromFilters(filters),
        [filters]
    )

    useEffect(() => {
        dispatch(
            initializeThematicLayer({
                eventStatus,
                renderingStrategy,
                defaultRenderingStrategy,
                periodType,
                startDate,
                endDate,
                filters,
                rows,
                orgUnits,
                systemSettings,
                syncFromOtherLayers,
            })
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Changes handling
    // -----

    // Data item
    useEffect(() => {
        if (dataItem) {
            setErrors((prev) => ({
                ...prev,
                dataError: null,
            }))
        }
    }, [dataItem])

    // Handle classification and legend
    useEffect(() => {
        if (!method && dataItem) {
            if (dataItem.legendSet) {
                dispatch(setClassification(CLASSIFICATION_PREDEFINED))
                dispatch(setLegendSet(dataItem.legendSet))
            } else {
                dispatch(setClassification(CLASSIFICATION_EQUAL_INTERVALS))
                dispatch(setLegendSet())
            }
        }
    }, [method, dataItem, dispatch])

    // Handle rendering strategy change
    useEffect(() => {
        if (
            !prevRenderingStrategy ||
            prevRenderingStrategy === renderingStrategy
        ) {
            return
        }

        switch (renderingStrategy) {
            case RENDERING_STRATEGY_SINGLE:
                if (
                    shouldSyncFromOtherLayers &&
                    backupPeriodsDates?.type === PREDEFINED_PERIODS
                ) {
                    dispatch(
                        setBackupPeriodsDates({
                            type: `${PREDEFINED_PERIODS}_${RENDERING_STRATEGY_TIMELINE}`,
                            periods: getPeriodsFromFilters(filters),
                        })
                    )
                    dispatch(setPeriods(backupPeriodsDates?.periods || []))
                }
                if (backupPeriodsDates?.type === START_END_DATES) {
                    dispatch(setPeriodType({ value: START_END_DATES }, true))
                }
                break
            case RENDERING_STRATEGY_TIMELINE:
                if (periodType === START_END_DATES) {
                    dispatch(setPeriodType({ value: PREDEFINED_PERIODS }, true))
                } else if (shouldSyncFromOtherLayers) {
                    dispatch(
                        setBackupPeriodsDates({
                            ...backupPeriodsDates,
                            type: PREDEFINED_PERIODS,
                            periods: getPeriodsFromFilters(filters),
                        })
                    )
                    if (
                        backupPeriodsDates?.type ===
                        `${PREDEFINED_PERIODS}_${RENDERING_STRATEGY_TIMELINE}`
                    ) {
                        dispatch(setPeriods(backupPeriodsDates?.periods || []))
                    } else {
                        syncFromOtherLayers({ renderingStrategy })
                    }
                }
                break
        }
    }, [
        periodType,
        prevRenderingStrategy,
        renderingStrategy,
        shouldSyncFromOtherLayers,
        startDate,
        endDate,
        backupPeriodsDates,
        filters,
        syncFromOtherLayers,
        dispatch,
    ])

    // Handle period type change
    useEffect(() => {
        if (prevRenderingStrategy !== renderingStrategy) {
            return
        }
        if (prevPeriodType && periodType !== prevPeriodType) {
            switch (periodType) {
                case PREDEFINED_PERIODS:
                    dispatch(
                        setBackupPeriodsDates({
                            ...backupPeriodsDates,
                            type: START_END_DATES,
                            startDate,
                            endDate,
                        })
                    )
                    if (
                        renderingStrategy === RENDERING_STRATEGY_SINGLE ||
                        !(
                            shouldSyncFromOtherLayers &&
                            syncFromOtherLayers({ renderingStrategy })
                        )
                    ) {
                        dispatch(setPeriods(backupPeriodsDates?.periods || []))
                    }
                    dispatch(setStartDate())
                    dispatch(setEndDate())
                    break
                case START_END_DATES:
                    dispatch(
                        setBackupPeriodsDates({
                            ...backupPeriodsDates,
                            type: PREDEFINED_PERIODS,
                            periods: getPeriodsFromFilters(filters),
                        })
                    )
                    dispatch(setStartDate(backupPeriodsDates?.startDate))
                    dispatch(setEndDate(backupPeriodsDates?.endDate))
                    dispatch(setPeriods([]))
                    break
            }
        } else if (
            errors.periodError &&
            (periodType !== prevPeriodType ||
                startDate !== prevStartDate ||
                endDate !== prevEndDate ||
                getPeriodsFromFilters(filters).length !==
                    getPeriodsFromFilters(prevFilters).length)
        ) {
            setErrors((prev) => ({
                ...prev,
                periodError: null,
            }))
        }
    }, [
        periodType,
        prevPeriodType,
        prevRenderingStrategy,
        renderingStrategy,
        shouldSyncFromOtherLayers,
        syncFromOtherLayers,
        startDate,
        prevStartDate,
        endDate,
        prevEndDate,
        backupPeriodsDates,
        errors?.periodError,
        filters,
        prevFilters,
        dispatch,
    ])

    // Validation
    // ----------

    // Layer validation function
    const validate = useCallback(() => {
        return validateThematicLayer({
            dataItem,
            periodType,
            startDate,
            endDate,
            rows,
            legendSet,
            radiusLow,
            radiusHigh,
            renderingStrategy,
            method,
            periods,
            legendIsolated,
        })
    }, [
        dataItem,
        periodType,
        startDate,
        endDate,
        rows,
        legendSet,
        radiusLow,
        radiusHigh,
        renderingStrategy,
        method,
        periods,
        legendIsolated,
    ])

    // Run layer validation
    useEffect(() => {
        if (!validateLayer || validateLayer === prevValidateLayer) {
            return
        }

        const { isValid, errors } = validate()
        setErrors(errors)
        setTab(errors.firstErrorTab)
        onLayerValidation(isValid)

        if (!isValid) {
            return
        }
        if (
            ![
                RENDERING_STRATEGY_SPLIT_BY_PERIOD,
                RENDERING_STRATEGY_TIMELINE,
            ].includes(renderingStrategy)
        ) {
            return
        }
        syncToOtherLayers({ periods, renderingStrategy })
    }, [
        validateLayer,
        prevValidateLayer,
        validate,
        renderingStrategy,
        periods,
        onLayerValidation,
        syncToOtherLayers,
        dispatch,
    ])

    return (
        <div className={styles.content} data-test="thematicdialog">
            <Tabs value={tab} onChange={setTab}>
                <Tab value="data" dataTest="thematicdialog-tabs-data">
                    {i18n.t('Data')}
                </Tab>
                <Tab value="period" dataTest="thematicdialog-tabs-period">
                    {i18n.t('Period')}
                </Tab>
                <Tab value="orgunits" dataTest="thematicdialog-tabs-orgunits">
                    {i18n.t('Org Units')}
                </Tab>
                <Tab value="filter" dataTest="thematicdialog-tabs-filter">
                    {i18n.t('Filter')}
                </Tab>
                <Tab value="style" dataTest="thematicdialog-tabs-style">
                    {i18n.t('Style')}
                </Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === 'data' && (
                    <div data-test="thematicdialog-datatab">
                        <div className={styles.flexRowFlow}>
                            <DataDimension
                                displayNameProp={
                                    currentUser.keyAnalysisDisplayProperty
                                }
                                selectedDimensions={
                                    dataItem
                                        ? [
                                              {
                                                  ...dataItem,
                                                  type: dataItem.dimensionItemType,
                                              },
                                          ]
                                        : []
                                }
                                onSelect={async ({ items }) => {
                                    const selected = items.at(-1) ?? {}
                                    const legendSet = await fetchLegendSet(
                                        selected
                                    )
                                    dispatch(
                                        setDataItem(
                                            { ...selected, legendSet },
                                            selected.type
                                        )
                                    )
                                }}
                                onCalculationSave={(items) =>
                                    dispatch(setDataItem(items, items.type))
                                }
                                height="408px"
                                heightCalculation="375px"
                                maxSelections={1}
                            />
                        </div>

                        <div className={styles.flexColumnFlow}>
                            <div className={styles.flexColumn}>
                                <div className={cx(styles.dataOptions)}>
                                    <AggregationTypeSelect
                                        className={styles.select}
                                    />
                                    <CompletedOnlyCheckbox />
                                </div>
                            </div>
                            <div className={styles.flexColumn}>
                                {errors.dataError && (
                                    <div
                                        className={styles.error}
                                        style={{ paddingLeft: '110px' }}
                                    >
                                        <IconErrorFilled24 />
                                        {errors.dataError}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'period' && (
                    <div
                        className={styles.flexRowFlow}
                        data-test="thematicdialog-periodtab"
                    >
                        <div className={styles.navigation}>
                            <RenderingStrategy
                                value={renderingStrategy}
                                periods={periods}
                                layerId={id}
                                onChange={(v) =>
                                    dispatch(setRenderingStrategy(v))
                                }
                            />
                        </div>
                        <div className={styles.background}>
                            <div
                                className={cx(
                                    styles.navigation,
                                    styles.periodBox
                                )}
                            >
                                {renderingStrategy ===
                                    RENDERING_STRATEGY_SINGLE && (
                                    <div>
                                        <SegmentedControl
                                            className={styles.flexRowFlow}
                                            options={[
                                                {
                                                    label: i18n.t(
                                                        'Choose from presets'
                                                    ),
                                                    value: PREDEFINED_PERIODS,
                                                },
                                                {
                                                    label: i18n.t(
                                                        'Define start - end dates'
                                                    ),
                                                    value: START_END_DATES,
                                                },
                                            ]}
                                            selected={periodType}
                                            onChange={({ value }) =>
                                                dispatch(
                                                    setPeriodType(
                                                        { value },
                                                        true
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                )}
                                {renderingStrategy ===
                                    RENDERING_STRATEGY_TIMELINE && (
                                    <div className={styles.periodText}>
                                        {i18n.t(
                                            'Choose periods for all timeline layers'
                                        )}
                                        {shouldSyncFromOtherLayers && (
                                            <span className={styles.infoText}>
                                                {i18n.t(
                                                    'Selection is initialized from shared periods'
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {renderingStrategy ===
                                    RENDERING_STRATEGY_SPLIT_BY_PERIOD && (
                                    <div className={styles.periodText}>
                                        {i18n.t(
                                            'Choose periods for all split layers'
                                        )}
                                    </div>
                                )}
                            </div>
                            {periodType === PREDEFINED_PERIODS && (
                                <PeriodDimension
                                    selectedPeriods={periods}
                                    onSelect={({ items }) =>
                                        dispatch(setPeriods(items))
                                    }
                                    excludedPeriodTypes={
                                        systemSettings.hiddenPeriods
                                    }
                                    height="324px"
                                />
                            )}
                            {periodType === START_END_DATES && (
                                <StartEndDate
                                    onSelectStartDate={(v) =>
                                        dispatch(setStartDate(v))
                                    }
                                    onSelectEndDate={(v) =>
                                        dispatch(setEndDate(v))
                                    }
                                    periodsSettings={periodsSettings}
                                />
                            )}
                            {errors.periodError && (
                                <div
                                    className={styles.error}
                                    style={{ paddingLeft: '474px' }}
                                >
                                    <IconErrorFilled24 />
                                    {errors.periodError}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'orgunits' && (
                    <OrgUnitSelect warning={errors.orgUnitsError} />
                )}

                {tab === 'filter' && (
                    <div
                        className={styles.flexRowFlow}
                        data-test="thematicdialog-filtertab"
                    >
                        <DimensionFilter dimensions={dimensions} />
                    </div>
                )}

                {tab === 'style' && (
                    <div
                        className={styles.flexColumnFlow}
                        data-test="thematicdialog-styletab"
                    >
                        <div className={styles.flexColumn}>
                            <ThematicMapTypeSelect type={thematicMapType} />
                            <div className={styles.flexInnerColumnFlow}>
                                <RadiusSelect className={styles.numberField} />
                            </div>
                            <Labels includeDisplayOption />
                            <Checkbox
                                label={i18n.t(
                                    'Count org units without coordinates'
                                )}
                                checked={!!countFeaturesWithoutCoordinates}
                                onChange={(checked) =>
                                    dispatch(
                                        setCountFeaturesWithoutCoordinates(
                                            checked
                                        )
                                    )
                                }
                            />
                        </div>
                        <div className={styles.flexColumn}>
                            <NumericLegendStyle
                                mapType={thematicMapType}
                                dataItem={dataItem}
                                legendSetError={errors.legendSetError}
                                className={styles.select}
                            />
                            <UnclassifiedLegend
                                value={unclassifiedLegend}
                                onChange={(v) =>
                                    dispatch(setUnclassifiedLegend(v))
                                }
                            />
                            <NoDataLegend
                                value={noDataLegend}
                                onChange={(v) => dispatch(setNoDataLegend(v))}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

ThematicDialog.propTypes = {
    backupPeriodsDates: PropTypes.object,
    columns: PropTypes.array,
    currentUser: PropTypes.object,
    endDate: PropTypes.string,
    eventStatus: PropTypes.string,
    filters: PropTypes.array,
    id: PropTypes.string,
    legendIsolated: PropTypes.object,
    legendSet: PropTypes.object,
    method: PropTypes.number,
    noDataLegend: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
    orgUnits: PropTypes.object,
    periodType: PropTypes.string,
    periodsSettings: PropTypes.object,
    radiusHigh: PropTypes.number,
    radiusLow: PropTypes.number,
    renderingStrategy: PropTypes.string,
    rows: PropTypes.array,
    startDate: PropTypes.string,
    systemSettings: PropTypes.object,
    thematicMapType: PropTypes.string,
    unclassifiedLegend: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
    validateLayer: PropTypes.bool,
    onLayerValidation: PropTypes.func,
}

export default ThematicDialog
