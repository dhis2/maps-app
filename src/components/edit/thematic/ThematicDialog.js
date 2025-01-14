import { PeriodDimension, getRelativePeriodsName } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { SegmentedControl, IconErrorFilled24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
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
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
    DEFAULT_ORG_UNIT_LEVEL,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
    RENDERING_STRATEGY_SINGLE,
} from '../../../constants/layers.js'
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import {
    getDataItemFromColumns,
    getOrgUnitsFromRows,
    getPeriodsFromFilters,
    getDimensionsFromFilters,
} from '../../../util/analytics.js'
import { isPeriodAvailable } from '../../../util/periods.js'
import { getStartEndDateError } from '../../../util/time.js'
import CalculationSelect from '../../calculations/CalculationSelect.js'
import NumericLegendStyle from '../../classification/NumericLegendStyle.js'
import { Tab, Tabs } from '../../core/index.js'
import DataElementGroupSelect from '../../dataElement/DataElementGroupSelect.js'
import DataElementOperandSelect from '../../dataElement/DataElementOperandSelect.js'
import DataElementSelect from '../../dataElement/DataElementSelect.js'
import TotalsDetailsSelect from '../../dataElement/TotalsDetailsSelect.js'
import EventDataItemSelect from '../../dataItem/EventDataItemSelect.js'
import DataSetsSelect from '../../dataSets/DataSetsSelect.js' // Reporting rate
import DimensionFilter from '../../dimensions/DimensionFilter.js'
import IndicatorGroupSelect from '../../indicator/IndicatorGroupSelect.js'
import IndicatorSelect from '../../indicator/IndicatorSelect.js'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.js'
import RenderingStrategy from '../../periods/RenderingStrategy.js'
import StartEndDate from '../../periods/StartEndDate.js'
import ProgramIndicatorSelect from '../../program/ProgramIndicatorSelect.js'
import ProgramSelect from '../../program/ProgramSelect.js'
import Labels from '../shared/Labels.js'
import styles from '../styles/LayerDialog.module.css'
import AggregationTypeSelect from './AggregationTypeSelect.js'
import CompletedOnlyCheckbox from './CompletedOnlyCheckbox.js'
import NoDataColor from './NoDataColor.js'
import RadiusSelect, { isValidRadius } from './RadiusSelect.js'
import ThematicMapTypeSelect from './ThematicMapTypeSelect.js'
import ValueTypeSelect from './ValueTypeSelect.js'

class ThematicDialog extends Component {
    static propTypes = {
        setBackupPeriodsDates: PropTypes.func.isRequired,
        setClassification: PropTypes.func.isRequired,
        setDataElementGroup: PropTypes.func.isRequired,
        setDataItem: PropTypes.func.isRequired,
        setEndDate: PropTypes.func.isRequired,
        setIndicatorGroup: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
        setNoDataColor: PropTypes.func.isRequired,
        setOperand: PropTypes.func.isRequired,
        setOrgUnits: PropTypes.func.isRequired,
        setPeriodType: PropTypes.func.isRequired,
        setPeriods: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setRenderingStrategy: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        setValueType: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
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
        valueType: PropTypes.string,
    }

    state = {
        tab: 'data',
    }

    componentDidMount() {
        const {
            valueType,
            columns,
            rows,
            filters,
            orgUnits,
            setValueType,
            startDate,
            systemSettings,
            endDate,
            setPeriods,
            setBackupPeriodsDates,
            setPeriodType,
            setOrgUnits,
        } = this.props

        const dataItem = getDataItemFromColumns(columns)
        const periods = getPeriodsFromFilters(filters)
        const { keyAnalysisRelativePeriod: defaultPeriod, hiddenPeriods } =
            systemSettings

        // Set value type if favorite is loaded
        if (!valueType) {
            if (dataItem && dataItem.dimensionItemType) {
                const dimension = Object.keys(dimConf).find(
                    (dim) =>
                        dimConf[dim].itemType === dataItem.dimensionItemType
                )

                if (dimension) {
                    setValueType(dimConf[dimension].objectName, true)
                }
            } else {
                setValueType(dimConf.indicator.objectName)
            }
        }

        const hasDate = startDate !== undefined && endDate !== undefined

        if (hasDate) {
            const keepPeriod = false
            setPeriodType({ value: START_END_DATES }, keepPeriod)
        } else {
            const keepPeriod = true
            setPeriodType({ value: PREDEFINED_PERIODS }, keepPeriod)
        }

        // Set default period from system settings
        if (
            periods?.length == 0 &&
            !hasDate &&
            defaultPeriod &&
            isPeriodAvailable(defaultPeriod, hiddenPeriods)
        ) {
            const defaultPeriods = [
                {
                    id: defaultPeriod,
                    name: getRelativePeriodsName()[defaultPeriod],
                },
            ]
            setPeriods(defaultPeriods)
            setBackupPeriodsDates({
                startDate: DEFAULT_START_DATE,
                endDate: DEFAULT_END_DATE,
            })
        }

        // Set default org unit level
        if (!rows) {
            const defaultLevel = orgUnits.levels?.[DEFAULT_ORG_UNIT_LEVEL]

            if (defaultLevel) {
                const { id, name } = defaultLevel

                setOrgUnits({
                    dimension: 'ou',
                    items: [{ id: `LEVEL-${id}`, name }],
                })
            }
        }
    }

    componentDidUpdate(prev) {
        const {
            columns,
            periodType,
            renderingStrategy,
            setPeriods,
            setBackupPeriodsDates,
            setStartDate,
            setEndDate,
            setClassification,
            setLegendSet,
            setRenderingStrategy,
            validateLayer,
            onLayerValidation,
            startDate,
            endDate,
            filters,
            backupPeriodsDates,
        } = this.props
        const { periodError } = this.state

        // Set rendering strategy to single if not relative period
        if (
            periodType !== PREDEFINED_PERIODS &&
            renderingStrategy !== RENDERING_STRATEGY_SINGLE
        ) {
            setRenderingStrategy(RENDERING_STRATEGY_SINGLE)
        }

        // Set the default classification/legend for selected data item without visiting the style tab
        if (columns !== prev.columns) {
            const dataItem = getDataItemFromColumns(columns)

            if (dataItem) {
                if (dataItem.legendSet) {
                    setClassification(CLASSIFICATION_PREDEFINED)
                    setLegendSet(dataItem.legendSet)
                } else {
                    setClassification(CLASSIFICATION_EQUAL_INTERVALS)
                    setLegendSet()
                }
            }
        }

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate())
        }

        if (prev.periodType && periodType !== prev.periodType) {
            switch (periodType) {
                case PREDEFINED_PERIODS:
                    setBackupPeriodsDates({ startDate, endDate })
                    setPeriods(backupPeriodsDates?.periods || [])
                    setStartDate()
                    setEndDate()
                    break
                case START_END_DATES:
                    setBackupPeriodsDates({
                        periods: getPeriodsFromFilters(filters),
                    })
                    setStartDate(backupPeriodsDates?.startDate)
                    setEndDate(backupPeriodsDates?.endDate)
                    setPeriods([])
                    break
            }
        } else if (
            periodError &&
            (periodType !== prev.periodType ||
                startDate !== prev.startDate ||
                endDate !== prev.endDate ||
                getPeriodsFromFilters(filters).length !==
                    getPeriodsFromFilters(prev.filters).length)
        ) {
            this.setErrorState('periodError', null, 'period')
        }
    }

    render() {
        const {
            // Layer options
            columns,
            dataElementGroup,
            filters,
            id,
            indicatorGroup,
            noDataColor,
            operand,
            periodType,
            renderingStrategy,
            program,
            valueType,
            thematicMapType,
            systemSettings,
            periodsSettings,
        } = this.props

        const {
            // Handlers
            setDataItem,
            setDataElementGroup,
            setIndicatorGroup,
            setNoDataColor,
            setOperand,
            setPeriods,
            setPeriodType,
            setRenderingStrategy,
            setProgram,
            setValueType,
        } = this.props

        const {
            tab,
            indicatorGroupError,
            indicatorError,
            dataElementGroupError,
            dataElementError,
            dataSetError,
            programError,
            calculationError,
            eventDataItemError,
            programIndicatorError,
            periodError,
            orgUnitsError,
            legendSetError,
        } = this.state

        const periods = getPeriodsFromFilters(filters)
        const dataItem = getDataItemFromColumns(columns)
        const dimensions = getDimensionsFromFilters(filters)

        return (
            <div className={styles.content} data-test="thematicdialog">
                <Tabs value={tab} onChange={(tab) => this.setState({ tab })}>
                    <Tab value="data" dataTest="thematicdialog-tabs-data">
                        {i18n.t('Data')}
                    </Tab>
                    <Tab value="period" dataTest="thematicdialog-tabs-period">
                        {i18n.t('Period')}
                    </Tab>
                    <Tab
                        value="orgunits"
                        dataTest="thematicdialog-tabs-orgunits"
                    >
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
                                onChange={setValueType}
                            />
                            {(!valueType ||
                                valueType === dimConf.indicator.objectName) && [
                                // Indicator (default)
                                <IndicatorGroupSelect
                                    key="group"
                                    indicatorGroup={indicatorGroup}
                                    onChange={setIndicatorGroup}
                                    className={styles.select}
                                    errorText={indicatorGroupError}
                                />,
                                <IndicatorSelect
                                    key="indicator"
                                    indicatorGroup={indicatorGroup}
                                    indicator={dataItem}
                                    onChange={setDataItem}
                                    className={styles.select}
                                    errorText={indicatorError}
                                />,
                            ]}
                            {(valueType === dimConf.dataElement.objectName ||
                                valueType === dimConf.operand.objectName) && [
                                // Data element
                                <DataElementGroupSelect
                                    key="group"
                                    dataElementGroup={dataElementGroup}
                                    onChange={setDataElementGroup}
                                    className={styles.select}
                                    errorText={dataElementGroupError}
                                />,
                                dataElementGroup && (
                                    <TotalsDetailsSelect
                                        key="totals"
                                        operand={operand}
                                        onChange={setOperand}
                                        className={styles.select}
                                    />
                                ),
                                operand === true ||
                                valueType === dimConf.operand.objectName ? (
                                    <DataElementOperandSelect
                                        key="element"
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={setDataItem}
                                        className={styles.select}
                                        errorText={dataElementError}
                                    />
                                ) : (
                                    <DataElementSelect
                                        key="element"
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={setDataItem}
                                        className={styles.select}
                                        errorText={dataElementError}
                                    />
                                ),
                            ]}
                            {valueType === dimConf.dataSet.objectName && ( // Reporting rates
                                <DataSetsSelect
                                    key="item"
                                    dataSet={dataItem}
                                    onChange={setDataItem}
                                    className={styles.select}
                                    errorText={dataSetError}
                                />
                            )}
                            {valueType === dimConf.eventDataItem.objectName && [
                                // Event data items
                                <ProgramSelect
                                    key="program"
                                    program={program}
                                    onChange={setProgram}
                                    className={styles.select}
                                    errorText={programError}
                                />,
                                program && (
                                    <EventDataItemSelect
                                        key="item"
                                        program={program}
                                        dataItem={dataItem}
                                        onChange={setDataItem}
                                        className={styles.select}
                                        errorText={eventDataItemError}
                                    />
                                ),
                            ]}
                            {valueType ===
                                dimConf.programIndicator.objectName && [
                                // Program indicator
                                <ProgramSelect
                                    key="program"
                                    program={program}
                                    onChange={setProgram}
                                    className={styles.select}
                                    errorText={programError}
                                />,
                                program && (
                                    <ProgramIndicatorSelect
                                        key="indicator"
                                        program={program}
                                        programIndicator={dataItem}
                                        onChange={setDataItem}
                                        className={styles.select}
                                        errorText={programIndicatorError}
                                    />
                                ),
                            ]}
                            {valueType === dimConf.calculation.objectName && (
                                <CalculationSelect
                                    calculation={dataItem}
                                    onChange={setDataItem}
                                    className={styles.select}
                                    errorText={calculationError}
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
                                    onChange={setPeriodType}
                                ></SegmentedControl>
                            </div>
                            {periodType === PREDEFINED_PERIODS && (
                                <PeriodDimension
                                    selectedPeriods={periods}
                                    onSelect={(e) => {
                                        setPeriods(e.items)
                                    }}
                                    excludedPeriodTypes={
                                        systemSettings.hiddenPeriods
                                    }
                                    height="350px"
                                />
                            )}
                            {periodType === PREDEFINED_PERIODS && (
                                <RenderingStrategy
                                    value={renderingStrategy}
                                    periods={periods}
                                    layerId={id}
                                    onChange={setRenderingStrategy}
                                />
                            )}
                            {periodType === START_END_DATES && (
                                <StartEndDate
                                    onSelectStartDate={setStartDate}
                                    onSelectEndDate={setEndDate}
                                    periodsSettings={periodsSettings}
                                />
                            )}
                            {periodError && (
                                <div key="error" className={styles.error}>
                                    <IconErrorFilled24 />
                                    {periodError}
                                </div>
                            )}
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <OrgUnitSelect warning={orgUnitsError} />
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
                                    <RadiusSelect
                                        className={styles.numberField}
                                    />
                                </div>
                                <Labels includeDisplayOption={true} />
                            </div>
                            <div className={styles.flexColumn}>
                                <NumericLegendStyle
                                    mapType={thematicMapType}
                                    dataItem={dataItem}
                                    legendSetError={legendSetError}
                                    className={styles.select}
                                />
                                <NoDataColor
                                    value={noDataColor}
                                    onChange={setNoDataColor}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // TODO: Add to parent class?
    setErrorState(key, message, tab) {
        this.setState({
            [key]: message,
            tab,
        })

        return false
    }

    validate() {
        const {
            // Layer options
            valueType,
            indicatorGroup,
            dataElementGroup,
            program,
            periodType,
            columns,
            rows,
            filters,
            startDate,
            endDate,
            radiusLow,
            radiusHigh,
            method,
            legendSet,
        } = this.props
        const dataItem = getDataItemFromColumns(columns)
        const periods = getPeriodsFromFilters(filters)

        // Indicators
        if (valueType === dimConf.indicator.objectName) {
            if (!indicatorGroup && !dataItem) {
                return this.setErrorState(
                    'indicatorGroupError',
                    i18n.t('Indicator group is required'),
                    'data'
                )
            } else if (!dataItem) {
                return this.setErrorState(
                    'indicatorError',
                    i18n.t('Indicator is required'),
                    'data'
                )
            }
        }

        // Data elements
        if (
            valueType === dimConf.dataElement.objectName ||
            valueType === dimConf.operand.objectName
        ) {
            if (!dataElementGroup && !dataItem) {
                return this.setErrorState(
                    'dataElementGroupError',
                    i18n.t('Data element group is required'),
                    'data'
                )
            } else if (!dataItem) {
                return this.setErrorState(
                    'dataElementError',
                    i18n.t('Data element is required'),
                    'data'
                )
            }
        }

        // Reporting rates
        if (valueType === dimConf.dataSet.objectName && !dataItem) {
            return this.setErrorState(
                'dataSetError',
                i18n.t('Data set is required'),
                'data'
            )
        }

        // Event data items / Program indicators
        if (
            valueType === dimConf.eventDataItem.objectName ||
            valueType === dimConf.programIndicator.objectName
        ) {
            if (!program && !dataItem) {
                return this.setErrorState(
                    'programError',
                    i18n.t('Program is required'),
                    'data'
                )
            } else if (!dataItem) {
                return valueType === dimConf.eventDataItem.objectName
                    ? this.setErrorState(
                          'eventDataItemError',
                          i18n.t('Event data item is required'),
                          'data'
                      )
                    : this.setErrorState(
                          'programIndicatorError',
                          i18n.t('Program indicator is required'),
                          'data'
                      )
            }
        }

        // Calculation
        if (valueType === dimConf.calculation.objectName && !dataItem) {
            return this.setErrorState(
                'calculationError',
                i18n.t('Calculation is required'),
                'data'
            )
        }

        if (periods?.length === 0 && periodType !== START_END_DATES) {
            return this.setErrorState(
                'periodError',
                i18n.t('Period is required'),
                'period'
            )
        } else if (periodType === START_END_DATES) {
            const error = getStartEndDateError(startDate, endDate)
            if (error) {
                return this.setErrorState('periodError', error, 'period')
            }
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected'),
                'orgunits'
            )
        }

        if (method === CLASSIFICATION_PREDEFINED && !legendSet) {
            return this.setErrorState(
                'legendSetError',
                i18n.t('No legend set is selected'),
                'style'
            )
        }

        if (!isValidRadius(radiusLow, radiusHigh)) {
            this.setState({ tab: 'style' })
            return false
        }

        return true
    }
}

export default connect(
    null,
    {
        setClassification,
        setDataItem,
        setDataElementGroup,
        setIndicatorGroup,
        setLegendSet,
        setNoDataColor,
        setOperand,
        setOrgUnits,
        setPeriods,
        setBackupPeriodsDates,
        setStartDate,
        setEndDate,
        setPeriodType,
        setRenderingStrategy,
        setProgram,
        setValueType,
    },
    null,
    {
        forwardRef: true,
    }
)(ThematicDialog)
