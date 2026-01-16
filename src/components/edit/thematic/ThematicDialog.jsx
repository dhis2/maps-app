import { PeriodDimension, getRelativePeriodsName } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { SegmentedControl, IconErrorFilled24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
    setClassification,
    setDataItem,
    setDataElementGroup,
    setIndicatorGroup,
    setLegendSet,
    setNoDataColor,
    setOperand,
    setOrgUnits,
    setPeriods,
    setStartDate,
    setEndDate,
    setBackupPeriodsDates,
    setPeriodType,
    setRenderingStrategy,
    setProgram,
    setValueType,
} from '../../../actions/layerEdit.js'
import { dimConf } from '../../../constants/dimension.js'
import {
    DEFAULT_ORG_UNIT_LEVEL,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
    RENDERING_STRATEGY_SINGLE,
} from '../../../constants/layers.js'
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import usePrevious from '../../../hooks/usePrevious.js'
import {
    getDataItemFromColumns,
    getOrgUnitsFromRows,
    getPeriodsFromFilters,
    getDimensionsFromFilters,
} from '../../../util/analytics.js'
import { getDefaultDatesInCalendar } from '../../../util/date.js'
import { isPeriodAvailable } from '../../../util/periods.js'
import { getStartEndDateError } from '../../../util/time.js'
import CalculationSelect from '../../calculations/CalculationSelect.jsx'
import NumericLegendStyle from '../../classification/NumericLegendStyle.jsx'
import { Tab, Tabs } from '../../core/index.js'
import DataElementGroupSelect from '../../dataElement/DataElementGroupSelect.jsx'
import DataElementOperandSelect from '../../dataElement/DataElementOperandSelect.jsx'
import DataElementSelect from '../../dataElement/DataElementSelect.jsx'
import TotalsDetailsSelect from '../../dataElement/TotalsDetailsSelect.jsx'
import EventDataItemSelect from '../../dataItem/EventDataItemSelect.jsx'
import DataSetsSelect from '../../dataSets/DataSetsSelect.jsx'
import DimensionFilter from '../../dimensions/DimensionFilter.jsx'
import IndicatorGroupSelect from '../../indicator/IndicatorGroupSelect.jsx'
import IndicatorSelect from '../../indicator/IndicatorSelect.jsx'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.jsx'
import RenderingStrategy from '../../periods/RenderingStrategy.jsx'
import StartEndDate from '../../periods/StartEndDate.jsx'
import ProgramIndicatorSelect from '../../program/ProgramIndicatorSelect.jsx'
import ProgramSelect from '../../program/ProgramSelect.jsx'
import Labels from '../shared/Labels.jsx'
import styles from '../styles/LayerDialog.module.css'
import AggregationTypeSelect from './AggregationTypeSelect.jsx'
import CompletedOnlyCheckbox from './CompletedOnlyCheckbox.jsx'
import NoDataColor from './NoDataColor.jsx'
import RadiusSelect, { isValidRadius } from './RadiusSelect.jsx'
import ThematicMapTypeSelect from './ThematicMapTypeSelect.jsx'
import ValueTypeSelect from './ValueTypeSelect.jsx'

const ThematicDialog = ({
    columns,
    rows,
    filters,
    orgUnits,
    valueType,
    startDate,
    endDate,
    backupPeriodsDates,
    systemSettings,
    periodType,
    renderingStrategy,
    id,
    program,
    noDataColor,
    periodsSettings,
    validateLayer,
    onLayerValidation,
    indicatorGroup,
    dataElementGroup,
    legendSet,
    radiusLow,
    radiusHigh,
    method,
    thematicMapType,
    operand,
}) => {
    const dispatch = useDispatch()

    const [tab, setTab] = useState('data')
    const [errors, setErrors] = useState({})

    const prevFilters = usePrevious(filters)
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

    // Layer validation function
    const validate = useCallback(() => {
        const newErrors = {}

        // Indicators
        if (valueType === dimConf.indicator.objectName) {
            if (!indicatorGroup && !dataItem) {
                newErrors.indicatorGroupError = i18n.t(
                    'Indicator group is required'
                )
            }
            if (!dataItem) {
                newErrors.indicatorError = i18n.t('Indicator is required')
            }
        }

        // Data elements
        if (
            [
                dimConf.dataElement.objectName,
                dimConf.operand.objectName,
            ].includes(valueType)
        ) {
            if (!dataElementGroup && !dataItem) {
                newErrors.dataElementGroupError = i18n.t(
                    'Data element group is required'
                )
            }
            if (!dataItem) {
                newErrors.dataElementError = i18n.t('Data element is required')
            }
        }

        // Data sets
        if (valueType === dimConf.dataSet.objectName && !dataItem) {
            newErrors.dataSetError = i18n.t('Data set is required')
        }

        // Event data items / Program indicators
        if (
            [
                dimConf.eventDataItem.objectName,
                dimConf.programIndicator.objectName,
            ].includes(valueType)
        ) {
            if (!program && !dataItem) {
                newErrors.programError = i18n.t('Program is required')
            }
            if (!dataItem) {
                if (valueType === dimConf.eventDataItem.objectName) {
                    newErrors.eventDataItemError = i18n.t(
                        'Event data item is required'
                    )
                } else {
                    newErrors.programIndicatorError = i18n.t(
                        'Program indicator is required'
                    )
                }
            }
        }

        // Calculation
        if (valueType === dimConf.calculation.objectName && !dataItem) {
            newErrors.calculationError = i18n.t('Calculation is required')
        }

        // Periods
        if ((periods ?? []).length === 0 && periodType !== START_END_DATES) {
            newErrors.periodError = i18n.t('Period is required')
        }
        if (periodType === START_END_DATES) {
            const error = getStartEndDateError(startDate, endDate)
            if (error) {
                newErrors.periodError = error
            }
        }

        // Org units
        if (!getOrgUnitsFromRows(rows).length) {
            newErrors.orgUnitsError = i18n.t(
                'No organisation units are selected'
            )
        }

        // Legend set
        if (method === CLASSIFICATION_PREDEFINED && !legendSet) {
            newErrors.legendSetError = i18n.t('No legend set is selected')
        }

        // Radius
        if (!isValidRadius(radiusLow, radiusHigh)) {
            setTab('style')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [
        valueType,
        indicatorGroup,
        dataElementGroup,
        dataItem,
        program,
        periodType,
        startDate,
        endDate,
        rows,
        legendSet,
        radiusLow,
        radiusHigh,
        method,
        periods,
    ])

    // Set value type if favorite is loaded
    useEffect(() => {
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
    }, [valueType, dataItem?.dimensionItemType, dispatch])

    // Set period type if favorite is loaded or dates are present
    useEffect(() => {
        if (!periodType) {
            const hasDate = startDate !== undefined && endDate !== undefined
            if (hasDate) {
                dispatch(setPeriodType({ value: START_END_DATES }, false))
            } else {
                dispatch(setPeriodType({ value: PREDEFINED_PERIODS }, true))
            }
        }
    }, [periodType, startDate, endDate, dispatch])

    // Set default period from system settings if filters not available and no dates
    useEffect(() => {
        if (!filters) {
            const hasDate = startDate !== undefined && endDate !== undefined
            const { keyAnalysisRelativePeriod: defaultPeriod, hiddenPeriods } =
                systemSettings || {}
            if (!hasDate && isPeriodAvailable(defaultPeriod, hiddenPeriods)) {
                dispatch(
                    setPeriods([
                        {
                            id: defaultPeriod,
                            name: getRelativePeriodsName()[defaultPeriod],
                        },
                    ])
                )
                dispatch(setBackupPeriodsDates(getDefaultDatesInCalendar()))
            }
        }
    }, [filters, systemSettings, startDate, endDate, dispatch])

    // Set default org unit level if not available from favorite
    useEffect(() => {
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
    }, [rows, orgUnits?.levels, dispatch])

    // Set rendering strategy to single if not relative period
    useEffect(() => {
        if (
            periodType !== PREDEFINED_PERIODS &&
            renderingStrategy !== RENDERING_STRATEGY_SINGLE
        ) {
            dispatch(setRenderingStrategy(RENDERING_STRATEGY_SINGLE))
        }
    }, [periodType, renderingStrategy, dispatch])

    // Set the default classification/legend for selected data item without visiting the style tab
    useEffect(() => {
        if (dataItem) {
            if (dataItem.legendSet) {
                dispatch(setClassification(CLASSIFICATION_PREDEFINED))
                dispatch(setLegendSet(dataItem.legendSet))
            } else {
                dispatch(setClassification(CLASSIFICATION_EQUAL_INTERVALS))
                dispatch(setLegendSet())
            }
        }
    }, [dataItem, dispatch])

    // Run validation
    useEffect(() => {
        if (validateLayer && validateLayer !== prevValidateLayer) {
            onLayerValidation(validate())
        }
    }, [validateLayer, prevValidateLayer, validate, onLayerValidation])

    useEffect(() => {
        if (prevPeriodType && periodType !== prevPeriodType) {
            switch (periodType) {
                case PREDEFINED_PERIODS:
                    dispatch(setBackupPeriodsDates({ startDate, endDate }))
                    dispatch(setPeriods(backupPeriodsDates?.periods || []))
                    dispatch(setStartDate())
                    dispatch(setEndDate())
                    break
                case START_END_DATES:
                    dispatch(
                        setBackupPeriodsDates({
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
                    <div
                        className={styles.flexRowFlow}
                        data-test="thematicdialog-datatab"
                    >
                        <ValueTypeSelect
                            value={valueType}
                            className={styles.select}
                            onChange={(v) => dispatch(setValueType(v))}
                        />
                        {(!valueType ||
                            valueType === dimConf.indicator.objectName) && (
                            <>
                                <IndicatorGroupSelect
                                    indicatorGroup={indicatorGroup}
                                    onChange={(v) =>
                                        dispatch(setIndicatorGroup(v))
                                    }
                                    className={styles.select}
                                    errorText={errors.indicatorGroupError}
                                />
                                <IndicatorSelect
                                    indicatorGroup={indicatorGroup}
                                    indicator={dataItem}
                                    onChange={(v, t) =>
                                        dispatch(setDataItem(v, t))
                                    }
                                    className={styles.select}
                                    errorText={errors.indicatorError}
                                />
                            </>
                        )}
                        {(valueType === dimConf.dataElement.objectName ||
                            valueType === dimConf.operand.objectName) && (
                            <>
                                <DataElementGroupSelect
                                    dataElementGroup={dataElementGroup}
                                    onChange={(v) =>
                                        dispatch(setDataElementGroup(v))
                                    }
                                    className={styles.select}
                                    errorText={errors.dataElementGroupError}
                                />
                                {dataElementGroup && (
                                    <TotalsDetailsSelect
                                        operand={operand}
                                        onChange={(v) =>
                                            dispatch(setOperand(v))
                                        }
                                        className={styles.select}
                                    />
                                )}
                                {operand ||
                                valueType === dimConf.operand.objectName ? (
                                    <DataElementOperandSelect
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={(v, t) =>
                                            dispatch(setDataItem(v, t))
                                        }
                                        className={styles.select}
                                        errorText={errors.dataElementError}
                                    />
                                ) : (
                                    <DataElementSelect
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={(v, t) =>
                                            dispatch(setDataItem(v, t))
                                        }
                                        className={styles.select}
                                        errorText={errors.dataElementError}
                                    />
                                )}
                            </>
                        )}
                        {valueType === dimConf.dataSet.objectName && (
                            <DataSetsSelect
                                dataSet={dataItem}
                                onChange={(v, t) => dispatch(setDataItem(v, t))}
                                className={styles.select}
                                errorText={errors.dataSetError}
                            />
                        )}
                        {valueType === dimConf.eventDataItem.objectName && (
                            <>
                                <ProgramSelect
                                    program={program}
                                    onChange={(v) => dispatch(setProgram(v))}
                                    className={styles.select}
                                    errorText={errors.programError}
                                />
                                {program && (
                                    <EventDataItemSelect
                                        program={program}
                                        dataItem={dataItem}
                                        onChange={(v, t) =>
                                            dispatch(setDataItem(v, t))
                                        }
                                        className={styles.select}
                                        errorText={errors.eventDataItemError}
                                    />
                                )}
                            </>
                        )}
                        {valueType === dimConf.programIndicator.objectName && (
                            <>
                                <ProgramSelect
                                    program={program}
                                    onChange={(v) => dispatch(setProgram(v))}
                                    className={styles.select}
                                    errorText={errors.programError}
                                />
                                {program && (
                                    <ProgramIndicatorSelect
                                        program={program}
                                        programIndicator={dataItem}
                                        onChange={(v, t) =>
                                            dispatch(setDataItem(v, t))
                                        }
                                        className={styles.select}
                                        errorText={errors.programIndicatorError}
                                    />
                                )}
                            </>
                        )}
                        {valueType === dimConf.calculation.objectName && (
                            <CalculationSelect
                                calculation={dataItem}
                                onChange={(v, t) => dispatch(setDataItem(v, t))}
                                className={styles.select}
                                errorText={errors.calculationError}
                            />
                        )}

                        <AggregationTypeSelect className={styles.select} />
                        <CompletedOnlyCheckbox valueType={valueType} />
                    </div>
                )}

                {tab === 'period' && (
                    <div
                        className={styles.flexRowFlow}
                        data-test="thematicdialog-periodtab"
                    >
                        <div className={styles.navigation}>
                            <SegmentedControl
                                className={styles.flexRowFlow}
                                options={[
                                    {
                                        label: i18n.t('Choose from presets'),
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
                                onChange={(e) =>
                                    dispatch(
                                        setPeriodType({ value: e.value }, true)
                                    )
                                }
                            />
                        </div>
                        {periodType === PREDEFINED_PERIODS && (
                            <>
                                <PeriodDimension
                                    selectedPeriods={periods}
                                    onSelect={(e) =>
                                        dispatch(setPeriods(e.items))
                                    }
                                    excludedPeriodTypes={
                                        systemSettings.hiddenPeriods
                                    }
                                    height="324px"
                                />
                                <RenderingStrategy
                                    value={renderingStrategy}
                                    periods={periods}
                                    layerId={id}
                                    onChange={(v) =>
                                        dispatch(setRenderingStrategy(v))
                                    }
                                />
                            </>
                        )}
                        {periodType === START_END_DATES && (
                            <StartEndDate
                                onSelectStartDate={(v) =>
                                    dispatch(setStartDate(v))
                                }
                                onSelectEndDate={(v) => dispatch(setEndDate(v))}
                                periodsSettings={periodsSettings}
                            />
                        )}
                        {errors.periodError && (
                            <div className={styles.error}>
                                <IconErrorFilled24 />
                                {errors.periodError}
                            </div>
                        )}
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
                        </div>
                        <div className={styles.flexColumn}>
                            <NumericLegendStyle
                                mapType={thematicMapType}
                                dataItem={dataItem}
                                legendSetError={errors.legendSetError}
                                className={styles.select}
                            />
                            <NoDataColor
                                value={noDataColor}
                                onChange={(v) => dispatch(setNoDataColor(v))}
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
    dataElementGroup: PropTypes.object,
    endDate: PropTypes.string,
    filters: PropTypes.array,
    id: PropTypes.string,
    indicatorGroup: PropTypes.object,
    legendSet: PropTypes.object,
    method: PropTypes.number,
    noDataColor: PropTypes.string,
    operand: PropTypes.bool,
    orgUnits: PropTypes.object,
    periodType: PropTypes.string,
    periodsSettings: PropTypes.object,
    program: PropTypes.object,
    radiusHigh: PropTypes.number,
    radiusLow: PropTypes.number,
    renderingStrategy: PropTypes.string,
    rows: PropTypes.array,
    startDate: PropTypes.string,
    systemSettings: PropTypes.object,
    thematicMapType: PropTypes.string,
    validateLayer: PropTypes.bool,
    valueType: PropTypes.string,
    onLayerValidation: PropTypes.func,
}

export default ThematicDialog
