import cx from 'classnames'
import { PeriodDimension } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
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
    RELATIVE_PERIODS,
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
import PeriodSelect from '../../periods/PeriodSelect.js'
import PeriodTypeSelect from '../../periods/PeriodTypeSelect.js'
import RelativePeriodSelect from '../../periods/RelativePeriodSelect.js'
import RenderingStrategy from '../../periods/RenderingStrategy.js'
import StartEndDates from '../../periods/StartEndDates.js'
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
        setClassification: PropTypes.func.isRequired,
        setDataElementGroup: PropTypes.func.isRequired,
        setDataItem: PropTypes.func.isRequired,
        setIndicatorGroup: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
        setNoDataColor: PropTypes.func.isRequired,
        setOperand: PropTypes.func.isRequired,
        setOrgUnits: PropTypes.func.isRequired,
        setPeriods: PropTypes.func.isRequired,
        setPeriodType: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setRenderingStrategy: PropTypes.func.isRequired,
        setValueType: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
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
            setOrgUnits,
        } = this.props
        console.log(
            '🚀 ~ ThematicDialog ~ componentDidMount ~ filters:',
            filters
        )

        const dataItem = getDataItemFromColumns(columns)
        const periods = getPeriodsFromFilters(filters)
        console.log(
            '🚀 ~ ThematicDialog ~ componentDidMount ~ periods:',
            periods
        )

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

        console.log(
            '🚀 ~ ThematicDialog ~ componentDidMount ~ periods?.length == 0:',
            periods?.length == 0
        )
        console.log(
            '🚀 ~ ThematicDialog ~ componentDidMount ~ !startDate:',
            !startDate
        )
        console.log(
            '🚀 ~ ThematicDialog ~ componentDidMount ~ !endDate:',
            !endDate
        )
        console.log(
            '🚀 ~ ThematicDialog ~ componentDidMount ~ defaultPeriod:',
            defaultPeriod
        )
        console.log(
            '🚀 ~ ThematicDialog ~ componentDidMount ~ isPeriodAvailable(defaultPeriod, hiddenPeriods):',
            isPeriodAvailable(defaultPeriod, hiddenPeriods)
        )
        // Set default period from system settings
        if (
            periods?.length == 0 &&
            !startDate &&
            !endDate &&
            defaultPeriod &&
            isPeriodAvailable(defaultPeriod, hiddenPeriods)
        ) {
            const defaultPeriods = [
                {
                    id: defaultPeriod,
                },
            ]
            setPeriods(defaultPeriods)
            //setPeriodType(RELATIVE_PERIODS)
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
            setClassification,
            setLegendSet,
            setRenderingStrategy,
            validateLayer,
            onLayerValidation,
        } = this.props
        console.log(
            '🚀 ~ ThematicDialog ~ componentDidUpdate ~ periodType:',
            periodType
        )

        // Set rendering strategy to single if not relative period
        if (
            periodType !== RELATIVE_PERIODS &&
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
    }

    render() {
        const {
            // layer options
            columns,
            dataElementGroup,
            filters,
            id,
            indicatorGroup,
            noDataColor,
            operand,
            periodType,
            renderingStrategy,
            startDate,
            endDate,
            program,
            valueType,
            thematicMapType,
            systemSettings,
            periodsSettings,
        } = this.props
        console.log('🚀 ~ ThematicDialog ~ render ~ filters:', filters)
        console.log('🚀 ~ ThematicDialog ~ render ~ periodType:', periodType)

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
            periodTypeError,
            periodError,
            orgUnitsError,
            legendSetError,
        } = this.state

        const periods = getPeriodsFromFilters(filters)
        console.log('🚀 ~ ThematicDialog ~ render ~ periods:', periods)
        const dataItem = getDataItemFromColumns(columns)
        const dimensions = getDimensionsFromFilters(filters)

        const setPeriodsFromFilter = (e) => {
            console.log('🚀 ~ ThematicDialog ~ setPeriodsFromFilter ~ e:', e)
            setPeriods(e.items)
            //setPeriodType(RELATIVE_PERIODS)
        }

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
                            className={cx(
                                styles.flexRowFlow,
                                styles.periodDimension
                            )}
                            data-test="thematicdialog-periodtab"
                        >
                            <PeriodDimension
                                selectedPeriods={periods}
                                onSelect={setPeriodsFromFilter}
                                excludedPeriodTypes={
                                    systemSettings.hiddenPeriods
                                }
                            />
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
        console.log('🚀 ~ ThematicDialog ~ validate ~ filters:', filters)
        const dataItem = getDataItemFromColumns(columns)
        const periods = getPeriodsFromFilters(filters)
        console.log('🚀 ~ ThematicDialog ~ validate ~ periods:', periods)

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
        console.log('🚀 ~ ThematicDialog ~ validate ~ Indicators: OK')

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
        console.log('🚀 ~ ThematicDialog ~ validate ~ Data elements: OK')

        // Reporting rates
        if (valueType === dimConf.dataSet.objectName && !dataItem) {
            return this.setErrorState(
                'dataSetError',
                i18n.t('Data set is required'),
                'data'
            )
        }
        console.log('🚀 ~ ThematicDialog ~ validate ~ Reporting rates: OK')

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
        console.log(
            '🚀 ~ ThematicDialog ~ validate ~ Event data items / Program indicators: OK'
        )

        // Calculation
        if (valueType === dimConf.calculation.objectName && !dataItem) {
            return this.setErrorState(
                'calculationError',
                i18n.t('Calculation is required'),
                'data'
            )
        }
        console.log('🚀 ~ ThematicDialog ~ validate ~ Calculation: OK')

        console.log('🚀 ~ ThematicDialog ~ validate ~ periodType:', periodType)
        console.log(
            '🚀 ~ validate ~ periods?.length !== 0:',
            periods?.length !== 0
        )
        if (periods?.length === 0) {
            //&& periodType !== START_END_DATES) {
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
        console.log('🚀 ~ ThematicDialog ~ validate ~ periods: OK')

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
