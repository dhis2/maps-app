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
    setOrgUnitLevels,
    setOrgUnitGroups,
    setPeriod,
    setPeriodType,
    setRenderingStrategy,
    setProgram,
    setUserOrgUnits,
    setValueType,
    toggleOrgUnit,
    loadOrgUnitPath,
} from '../../../actions/layerEdit.js'
import { dimConf } from '../../../constants/dimension.js'
import {
    DEFAULT_ORG_UNIT_LEVEL,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
} from '../../../constants/layers.js'
import {
    RELATIVE_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import {
    getDataItemFromColumns,
    getOrgUnitsFromRows,
    getOrgUnitGroupsFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitNodesFromRows,
    getPeriodFromFilters,
    getDimensionsFromFilters,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics.js'
import { isPeriodAvailable } from '../../../util/periods.js'
import { getStartEndDateError } from '../../../util/time.js'
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
import OrgUnitFieldSelect from '../../orgunits/OrgUnitFieldSelect.js'
import OrgUnitGroupSelect from '../../orgunits/OrgUnitGroupSelect.js'
import OrgUnitLevelSelect from '../../orgunits/OrgUnitLevelSelect.js'
import OrgUnitTree from '../../orgunits/OrgUnitTree.js'
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect.js'
import PeriodSelect from '../../periods/PeriodSelect.js'
import PeriodTypeSelect from '../../periods/PeriodTypeSelect.js'
import RelativePeriodSelect from '../../periods/RelativePeriodSelect.js'
import RenderingStrategy from '../../periods/RenderingStrategy.js'
import StartEndDates from '../../periods/StartEndDates.js'
import ProgramIndicatorSelect from '../../program/ProgramIndicatorSelect.js'
import ProgramSelect from '../../program/ProgramSelect.js'
import { SystemSettingsCtx } from '../../SystemSettingsProvider.js'
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
        loadOrgUnitPath: PropTypes.func.isRequired,
        setClassification: PropTypes.func.isRequired,
        setDataElementGroup: PropTypes.func.isRequired,
        setDataItem: PropTypes.func.isRequired,
        setIndicatorGroup: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
        setNoDataColor: PropTypes.func.isRequired,
        setOperand: PropTypes.func.isRequired,
        setOrgUnitGroups: PropTypes.func.isRequired,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setPeriod: PropTypes.func.isRequired,
        setPeriodType: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setRenderingStrategy: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        setValueType: PropTypes.func.isRequired,
        settings: PropTypes.object.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        columns: PropTypes.array,
        dataElementGroup: PropTypes.object,
        defaultPeriod: PropTypes.string,
        endDate: PropTypes.string,
        filters: PropTypes.array,
        id: PropTypes.string,
        indicatorGroup: PropTypes.object,
        legendSet: PropTypes.object,
        method: PropTypes.number,
        noDataColor: PropTypes.string,
        operand: PropTypes.bool,
        periodType: PropTypes.string,
        program: PropTypes.object,
        radiusHigh: PropTypes.number,
        radiusLow: PropTypes.number,
        renderingStrategy: PropTypes.string,
        rows: PropTypes.array,
        startDate: PropTypes.string,
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
            defaultPeriod,
            setValueType,
            startDate,
            settings,
            endDate,
            setPeriod,
            setOrgUnitLevels,
        } = this.props

        const dataItem = getDataItemFromColumns(columns)
        const period = getPeriodFromFilters(filters)

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

        // Set default period from system settings

        if (
            !period &&
            !startDate &&
            !endDate &&
            defaultPeriod &&
            isPeriodAvailable(defaultPeriod, settings.hiddenPeriods)
        ) {
            setPeriod({
                id: defaultPeriod,
            })
        }

        // Set default org unit level
        if (!getOrgUnitsFromRows(rows).length) {
            setOrgUnitLevels([DEFAULT_ORG_UNIT_LEVEL])
        }
    }

    componentDidUpdate(prev) {
        const {
            rows,
            columns,
            setClassification,
            setLegendSet,
            loadOrgUnitPath,
            validateLayer,
            onLayerValidation,
        } = this.props

        if (rows !== prev.rows) {
            const orgUnits = getOrgUnitNodesFromRows(rows)

            // Load organisation unit tree path (temporary solution, as favorites don't include paths)
            orgUnits
                .filter((ou) => !ou.path)
                .forEach((ou) => loadOrgUnitPath(ou.id))
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
            settings,
            renderingStrategy,
            startDate,
            endDate,
            program,
            rows,
            valueType,
            thematicMapType,
        } = this.props

        const {
            // Handlers
            setDataItem,
            setDataElementGroup,
            setIndicatorGroup,
            setNoDataColor,
            setOperand,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setPeriod,
            setPeriodType,
            setRenderingStrategy,
            setProgram,
            setUserOrgUnits,
            setValueType,
            toggleOrgUnit,
        } = this.props

        const {
            tab,
            indicatorGroupError,
            indicatorError,
            dataElementGroupError,
            dataElementError,
            dataSetError,
            programError,
            eventDataItemError,
            programIndicatorError,
            periodTypeError,
            periodError,
            orgUnitsError,
            legendSetError,
        } = this.state

        const orgUnits = getOrgUnitsFromRows(rows)
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows)
        const period = getPeriodFromFilters(filters)
        const dataItem = getDataItemFromColumns(columns)
        const dimensions = getDimensionsFromFilters(filters)
        const hasUserOrgUnits = !!selectedUserOrgUnits.length

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
                            <AggregationTypeSelect className={styles.select} />
                            <CompletedOnlyCheckbox valueType={valueType} />
                        </div>
                    )}
                    {tab === 'period' && (
                        <div
                            className={styles.flexRowFlow}
                            data-test="thematicdialog-periodtab"
                        >
                            <PeriodTypeSelect
                                value={periodType}
                                period={period}
                                hiddenPeriods={settings.hiddenPeriods}
                                onChange={setPeriodType}
                                className={styles.periodSelect}
                                errorText={periodTypeError}
                            />
                            {periodType === RELATIVE_PERIODS && (
                                <RelativePeriodSelect
                                    period={period}
                                    onChange={setPeriod}
                                    className={styles.periodSelect}
                                    errorText={periodError}
                                />
                            )}
                            {((periodType &&
                                periodType !== RELATIVE_PERIODS &&
                                periodType !== START_END_DATES) ||
                                (!periodType && id)) && (
                                <PeriodSelect
                                    periodType={periodType}
                                    period={period}
                                    onChange={setPeriod}
                                    className={styles.periodSelect}
                                    errorText={periodError}
                                />
                            )}
                            {periodType === START_END_DATES && (
                                <StartEndDates
                                    startDate={startDate}
                                    endDate={endDate}
                                    className={styles.periodSelect}
                                    errorText={periodError}
                                />
                            )}
                            {periodType === RELATIVE_PERIODS && (
                                <RenderingStrategy
                                    value={renderingStrategy}
                                    period={period}
                                    layerId={id}
                                    onChange={setRenderingStrategy}
                                />
                            )}
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <div
                            className={styles.flexColumnFlow}
                            data-test="thematicdialog-orgunitstab"
                        >
                            <div className={styles.orgUnitTree}>
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                    disabled={hasUserOrgUnits}
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                <OrgUnitLevelSelect
                                    orgUnitLevel={getOrgUnitLevelsFromRows(
                                        rows
                                    )}
                                    onChange={setOrgUnitLevels}
                                    disabled={hasUserOrgUnits}
                                />
                                <OrgUnitGroupSelect
                                    orgUnitGroup={getOrgUnitGroupsFromRows(
                                        rows
                                    )}
                                    onChange={setOrgUnitGroups}
                                    disabled={hasUserOrgUnits}
                                />
                                <UserOrgUnitsSelect
                                    selected={selectedUserOrgUnits}
                                    onChange={setUserOrgUnits}
                                />
                                <OrgUnitFieldSelect />
                                {!orgUnits.length && orgUnitsError && (
                                    <div className={styles.error}>
                                        {orgUnitsError}
                                    </div>
                                )}
                            </div>
                        </div>
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
                                <Labels />
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
                                    className={styles.flexInnerColumnFlow}
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
        const dataItem = getDataItemFromColumns(columns)
        const period = getPeriodFromFilters(filters)

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

        if (!period && periodType !== START_END_DATES) {
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

const ThematicDialogWithSettings = (props) => (
    <SystemSettingsCtx.Consumer>
        {(settings) => <ThematicDialog settings={settings} {...props} />}
    </SystemSettingsCtx.Consumer>
)

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
        setOrgUnitLevels,
        setOrgUnitGroups,
        setPeriod,
        setPeriodType,
        setRenderingStrategy,
        setProgram,
        setUserOrgUnits,
        setValueType,
        toggleOrgUnit,
        loadOrgUnitPath,
    },
    null,
    {
        forwardRef: true,
    }
)(ThematicDialogWithSettings)
