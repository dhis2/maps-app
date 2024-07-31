import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SystemSettingsCtx } from '../../SystemSettingsProvider';
import { Tab, Tabs } from '../../core';
import ValueTypeSelect from './ValueTypeSelect';
import AggregationTypeSelect from './AggregationTypeSelect';
import CompletedOnlyCheckbox from './CompletedOnlyCheckbox';
import NoDataColor from './NoDataColor';
import DataElementGroupSelect from '../../dataElement/DataElementGroupSelect';
import DataElementSelect from '../../dataElement/DataElementSelect';
import DataElementOperandSelect from '../../dataElement/DataElementOperandSelect';
import TotalsDetailsSelect from '../../dataElement/TotalsDetailsSelect';
import EventDataItemSelect from '../../dataItem/EventDataItemSelect';
import DataSetsSelect from '../../dataSets/DataSetsSelect'; // Reporting rate
import IndicatorGroupSelect from '../../indicator/IndicatorGroupSelect';
import NumericLegendStyle from '../../classification/NumericLegendStyle';
import IndicatorSelect from '../../indicator/IndicatorSelect';
import OrgUnitGroupSelect from '../../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../../orgunits/OrgUnitLevelSelect';
import OrgUnitTree from '../../orgunits/OrgUnitTree';
import OrgUnitFieldSelect from '../../orgunits/OrgUnitFieldSelect';
import PeriodSelect from '../../periods/PeriodSelect';
import PeriodTypeSelect from '../../periods/PeriodTypeSelect';
import RenderingStrategy from '../../periods/RenderingStrategy';
import ProgramSelect from '../../program/ProgramSelect';
import ProgramIndicatorSelect from '../../program/ProgramIndicatorSelect';
import RelativePeriodSelect from '../../periods/RelativePeriodSelect';
import StartEndDates from '../../periods/StartEndDates';
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect';
import DimensionFilter from '../../dimensions/DimensionFilter';
import ThematicMapTypeSelect from './ThematicMapTypeSelect';
import RadiusSelect, { isValidRadius } from './RadiusSelect';
import Labels from '../shared/Labels';
import { dimConf } from '../../../constants/dimension';
import styles from '../styles/LayerDialog.module.css';

import {
    DEFAULT_ORG_UNIT_LEVEL,
    CLASSIFICATION_PREDEFINED,
    CLASSIFICATION_EQUAL_INTERVALS,
    RENDERING_STRATEGY_SINGLE,
} from '../../../constants/layers';

import { RELATIVE_PERIODS, START_END_DATES } from '../../../constants/periods';

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
} from '../../../actions/layerEdit';

import {
    getDataItemFromColumns,
    getOrgUnitsFromRows,
    getOrgUnitGroupsFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitNodesFromRows,
    getPeriodFromFilters,
    getDimensionsFromFilters,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics';

import { isPeriodAvailable } from '../../../util/periods';
import { getStartEndDateError } from '../../../util/time';

export class ThematicDialog extends Component {
    static propTypes = {
        id: PropTypes.string,
        columns: PropTypes.array,
        rows: PropTypes.array,
        filters: PropTypes.array,
        legendSet: PropTypes.object,
        method: PropTypes.number,
        indicatorGroup: PropTypes.object,
        dataElementGroup: PropTypes.object,
        noDataColor: PropTypes.string,
        program: PropTypes.object,
        operand: PropTypes.bool,
        defaultPeriod: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        periodType: PropTypes.string,
        periodsSettings: PropTypes.object,
        renderingStrategy: PropTypes.string,
        thematicMapType: PropTypes.string,
        valueType: PropTypes.string,
        radiusLow: PropTypes.number,
        radiusHigh: PropTypes.number,
        loadOrgUnitPath: PropTypes.func.isRequired,
        setClassification: PropTypes.func.isRequired,
        setDataItem: PropTypes.func.isRequired,
        setDataElementGroup: PropTypes.func.isRequired,
        setIndicatorGroup: PropTypes.func.isRequired,
        setLegendSet: PropTypes.func.isRequired,
        setNoDataColor: PropTypes.func.isRequired,
        setOperand: PropTypes.func.isRequired,
        setPeriod: PropTypes.func.isRequired,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setOrgUnitGroups: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        setPeriodType: PropTypes.func.isRequired,
        setRenderingStrategy: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setValueType: PropTypes.func.isRequired,
        settings: PropTypes.object.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    state = {
        tab: 'data',
    };

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
        } = this.props;

        const dataItem = getDataItemFromColumns(columns);
        const period = getPeriodFromFilters(filters);

        // Set value type if favorite is loaded
        if (!valueType) {
            if (dataItem && dataItem.dimensionItemType) {
                const dimension = Object.keys(dimConf).find(
                    dim => dimConf[dim].itemType === dataItem.dimensionItemType
                );

                if (dimension) {
                    setValueType(dimConf[dimension].objectName, true);
                }
            } else {
                setValueType(dimConf.indicator.objectName);
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
            });
        }

        // Set default org unit level
        if (!getOrgUnitsFromRows(rows).length) {
            setOrgUnitLevels([DEFAULT_ORG_UNIT_LEVEL]);
        }
    }

    componentDidUpdate(prev) {
        const {
            rows,
            columns,
            periodType,
            renderingStrategy,
            setClassification,
            setLegendSet,
            setRenderingStrategy,
            loadOrgUnitPath,
            validateLayer,
            onLayerValidation,
        } = this.props;

        // Set rendering strategy to single if not relative period
        if (
            periodType !== RELATIVE_PERIODS &&
            renderingStrategy !== RENDERING_STRATEGY_SINGLE
        ) {
            setRenderingStrategy(RENDERING_STRATEGY_SINGLE);
        }

        if (rows !== prev.rows) {
            const orgUnits = getOrgUnitNodesFromRows(rows);

            // Load organisation unit tree path (temporary solution, as favorites don't include paths)
            orgUnits
                .filter(ou => !ou.path)
                .forEach(ou => loadOrgUnitPath(ou.id));
        }

        // Set the default classification/legend for selected data item without visiting the style tab
        if (columns !== prev.columns) {
            const dataItem = getDataItemFromColumns(columns);

            if (dataItem) {
                if (dataItem.legendSet) {
                    setClassification(CLASSIFICATION_PREDEFINED);
                    setLegendSet(dataItem.legendSet);
                } else {
                    setClassification(CLASSIFICATION_EQUAL_INTERVALS);
                    setLegendSet();
                }
            }
        }

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate());
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
            periodsSettings,
            settings,
            renderingStrategy,
            startDate,
            endDate,
            program,
            rows,
            valueType,
            thematicMapType,
        } = this.props;

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
        } = this.props;

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
        } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const period = getPeriodFromFilters(filters);
        const dataItem = getDataItemFromColumns(columns);
        const dimensions = getDimensionsFromFilters(filters);
        const hasUserOrgUnits = !!selectedUserOrgUnits.length;

        return (
            <div className={styles.content} data-test="thematicdialog">
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
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
                                    hiddenPeriods={settings.hiddenPeriods}
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
                                    periodsSettings={periodsSettings}
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
        );
    }

    // TODO: Add to parent class?
    setErrorState(key, message, tab) {
        this.setState({
            [key]: message,
            tab,
        });

        return false;
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
        } = this.props;
        const dataItem = getDataItemFromColumns(columns);
        const period = getPeriodFromFilters(filters);

        // Indicators
        if (valueType === dimConf.indicator.objectName) {
            if (!indicatorGroup && !dataItem) {
                return this.setErrorState(
                    'indicatorGroupError',
                    i18n.t('Indicator group is required'),
                    'data'
                );
            } else if (!dataItem) {
                return this.setErrorState(
                    'indicatorError',
                    i18n.t('Indicator is required'),
                    'data'
                );
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
                );
            } else if (!dataItem) {
                return this.setErrorState(
                    'dataElementError',
                    i18n.t('Data element is required'),
                    'data'
                );
            }
        }

        // Reporting rates
        if (valueType === dimConf.dataSet.objectName && !dataItem) {
            return this.setErrorState(
                'dataSetError',
                i18n.t('Data set is required'),
                'data'
            );
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
                );
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
                      );
            }
        }

        if (!period && periodType !== START_END_DATES) {
            return this.setErrorState(
                'periodError',
                i18n.t('Period is required'),
                'period'
            );
        } else if (periodType === START_END_DATES) {
            const error = getStartEndDateError(startDate, endDate);

            if (error) {
                return this.setErrorState('periodError', error, 'period');
            }
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected'),
                'orgunits'
            );
        }

        if (method === CLASSIFICATION_PREDEFINED && !legendSet) {
            return this.setErrorState(
                'legendSetError',
                i18n.t('No legend set is selected'),
                'style'
            );
        }

        if (!isValidRadius(radiusLow, radiusHigh)) {
            this.setState({ tab: 'style' });
            return false;
        }

        return true;
    }
}

const ThematicDialogWithSettings = props => (
    <SystemSettingsCtx.Consumer>
        {settings => <ThematicDialog settings={settings} {...props} />}
    </SystemSettingsCtx.Consumer>
);

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
)(ThematicDialogWithSettings);
