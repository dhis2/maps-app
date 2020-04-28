import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Tabs from '../../core/Tabs';
import Tab from '../../core/Tab';
import TextField from '../../core/TextField';
import ValueTypeSelect from './ValueTypeSelect';
import AggregationTypeSelect from './AggregationTypeSelect';
import Checkbox from '../../core/Checkbox';
import DataElementGroupSelect from '../../dataElement/DataElementGroupSelect';
import DataElementSelect from '../../dataElement/DataElementSelect';
import DataElementOperandSelect from '../../dataElement/DataElementOperandSelect';
import TotalsDetailsSelect from '../../dataElement/TotalsDetailsSelect';
import EventDataItemSelect from '../../dataItem/EventDataItemSelect';
import DataSetsSelect from '../../dataSets/DataSetsSelect'; // Reporting rate
import FontStyle from '../../core/FontStyle';
import IndicatorGroupSelect from '../../indicator/IndicatorGroupSelect';
import NumericLegendStyle from '../../classification/NumericLegendStyle';
import IndicatorSelect from '../../indicator/IndicatorSelect';
import OrgUnitGroupSelect from '../../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../../orgunits/OrgUnitLevelSelect';
import OrgUnitTree from '../../orgunits/OrgUnitTree';
import PeriodSelect from '../../periods/PeriodSelect';
import PeriodTypeSelect from '../../periods/PeriodTypeSelect';
import ProgramSelect from '../../program/ProgramSelect';
import ProgramIndicatorSelect from '../../program/ProgramIndicatorSelect';
import RelativePeriodSelect from '../../periods/RelativePeriodSelect';
import DatePicker from '../../core/DatePicker';
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect';
import DimensionFilter from '../../dimensions/DimensionFilter';
import { layerDialogStyles } from '../LayerDialogStyles';
import { dimConf } from '../../../constants/dimension';
import {
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
    DEFAULT_ORG_UNIT_LEVEL,
} from '../../../constants/layers';

import {
    setDataItem,
    setDataElementGroup,
    setIndicatorGroup,
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
    setOperand,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setPeriod,
    setPeriodType,
    setStartDate,
    setEndDate,
    setProgram,
    setRadiusLow,
    setRadiusHigh,
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

import { getStartEndDateError } from '../../../util/time';

// TODO: Don't use inline styles!
const styles = {
    ...layerDialogStyles,
    wrapper: {
        width: '100%',
        clear: 'both',
        height: 64,
    },
    checkbox: {
        float: 'left',
        margin: '24px 0 0 12px',
        width: 180,
    },
    font: {
        float: 'left',
    },
    error: {
        marginTop: 10,
        color: 'red',
    },
};

export class ThematicDialog extends Component {
    static propTypes = {
        id: PropTypes.string,
        columns: PropTypes.array,
        rows: PropTypes.array,
        filters: PropTypes.array,
        labels: PropTypes.bool,
        labelFontColor: PropTypes.string,
        labelFontSize: PropTypes.string,
        labelFontStyle: PropTypes.string,
        labelFontWeight: PropTypes.string,
        indicatorGroup: PropTypes.object,
        dataElementGroup: PropTypes.object,
        program: PropTypes.object,
        operand: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        periodType: PropTypes.string,
        radiusHigh: PropTypes.number,
        radiusLow: PropTypes.number,
        valueType: PropTypes.string,
        loadOrgUnitPath: PropTypes.func.isRequired,
        setDataItem: PropTypes.func.isRequired,
        setDataElementGroup: PropTypes.func.isRequired,
        setIndicatorGroup: PropTypes.func.isRequired,
        setLabels: PropTypes.func.isRequired,
        setLabelFontColor: PropTypes.func.isRequired,
        setLabelFontSize: PropTypes.func.isRequired,
        setLabelFontStyle: PropTypes.func.isRequired,
        setLabelFontWeight: PropTypes.func.isRequired,
        setOperand: PropTypes.func.isRequired,
        setPeriod: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        setEndDate: PropTypes.func.isRequired,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setOrgUnitGroups: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        setPeriodType: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setRadiusLow: PropTypes.func.isRequired,
        setRadiusHigh: PropTypes.func.isRequired,
        setValueType: PropTypes.func.isRequired,
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
            setValueType,
            startDate,
            endDate,
            setStartDate,
            setEndDate,
            setOrgUnitLevels,
            rows,
        } = this.props;

        const dataItem = getDataItemFromColumns(columns);

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

        // Set default period (last year)
        if (!startDate && !endDate) {
            setStartDate(DEFAULT_START_DATE);
            setEndDate(DEFAULT_END_DATE);
        }

        if (!getOrgUnitsFromRows(rows).length) {
            setOrgUnitLevels([DEFAULT_ORG_UNIT_LEVEL]);
        }
    }

    componentDidUpdate(prev) {
        const {
            rows,
            loadOrgUnitPath,
            validateLayer,
            onLayerValidation,
        } = this.props;

        if (rows) {
            const orgUnits = getOrgUnitNodesFromRows(rows);

            // Load organisation unit tree path (temporary solution, as favorites don't include paths)
            orgUnits
                .filter(ou => !ou.path)
                .forEach(ou => loadOrgUnitPath(ou.id));
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
            labels,
            labelFontColor,
            labelFontSize,
            labelFontStyle,
            labelFontWeight,
            operand,
            periodType,
            startDate,
            endDate,
            program,
            radiusHigh,
            radiusLow,
            rows,
            valueType,
        } = this.props;

        const {
            // Handlers
            setDataItem,
            setDataElementGroup,
            setIndicatorGroup,
            setLabels,
            setLabelFontColor,
            setLabelFontSize,
            setLabelFontWeight,
            setLabelFontStyle,
            setOperand,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setPeriod,
            setStartDate,
            setEndDate,
            setPeriodType,
            setProgram,
            setRadiusLow,
            setRadiusHigh,
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
        } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const period = getPeriodFromFilters(filters);
        const dataItem = getDataItemFromColumns(columns);
        const dimensions = getDimensionsFromFilters(filters);
        const hasUserOrgUnits = !!selectedUserOrgUnits.length;

        return (
            <div data-test="thematicdialog">
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab
                        value="data"
                        label={i18n.t('data')}
                        data-test="thematicdialog-tabs-data"
                    />
                    <Tab
                        value="period"
                        label={i18n.t('period')}
                        data-test="thematicdialog-tabs-period"
                    />
                    <Tab
                        value="orgunits"
                        label={i18n.t('Org units')}
                        data-test="thematicdialog-tabs-orgunits"
                    />
                    <Tab
                        value="filter"
                        label={i18n.t('Filter')}
                        data-test="thematicdialog-tabs-filter"
                    />
                    <Tab
                        value="style"
                        label={i18n.t('Style')}
                        data-test="thematicdialog-tabs-style"
                    />
                </Tabs>
                <div style={styles.tabContent}>
                    {tab === 'data' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="thematicdialog-datatab"
                        >
                            <ValueTypeSelect
                                value={valueType}
                                style={styles.select}
                                onChange={setValueType}
                            />
                            {(!valueType ||
                                valueType === dimConf.indicator.objectName) && [
                                // Indicator (default)
                                <IndicatorGroupSelect
                                    key="group"
                                    indicatorGroup={indicatorGroup}
                                    onChange={setIndicatorGroup}
                                    style={styles.select}
                                    errorText={indicatorGroupError}
                                />,
                                <IndicatorSelect
                                    key="indicator"
                                    indicatorGroup={indicatorGroup}
                                    indicator={dataItem}
                                    onChange={setDataItem}
                                    style={styles.select}
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
                                    style={styles.select}
                                    errorText={dataElementGroupError}
                                />,
                                dataElementGroup && (
                                    <TotalsDetailsSelect
                                        key="totals"
                                        operand={operand}
                                        onChange={setOperand}
                                        style={styles.select}
                                    />
                                ),
                                operand === true ||
                                valueType === dimConf.operand.objectName ? (
                                    <DataElementOperandSelect
                                        key="element"
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
                                        errorText={dataElementError}
                                    />
                                ) : (
                                    <DataElementSelect
                                        key="element"
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
                                        errorText={dataElementError}
                                    />
                                ),
                            ]}
                            {valueType === dimConf.dataSet.objectName && ( // Reporting rates
                                <DataSetsSelect
                                    key="item"
                                    dataSet={dataItem}
                                    onChange={setDataItem}
                                    style={styles.select}
                                    errorText={dataSetError}
                                />
                            )}
                            {valueType === dimConf.eventDataItem.objectName && [
                                // Event data items
                                <ProgramSelect
                                    key="program"
                                    program={program}
                                    onChange={setProgram}
                                    style={styles.select}
                                    errorText={programError}
                                />,
                                program && (
                                    <EventDataItemSelect
                                        key="item"
                                        program={program}
                                        dataItem={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
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
                                    style={styles.select}
                                    errorText={programError}
                                />,
                                program && (
                                    <ProgramIndicatorSelect
                                        key="indicator"
                                        program={program}
                                        programIndicator={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
                                        errorText={programIndicatorError}
                                    />
                                ),
                            ]}
                            <AggregationTypeSelect style={styles.select} />
                        </div>
                    )}
                    {tab === 'period' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="thematicdialog-periodtab"
                        >
                            <PeriodTypeSelect
                                value={periodType}
                                onChange={type => setPeriodType(type.id)}
                                style={styles.select}
                                errorText={periodTypeError}
                            />
                            {periodType === 'relativePeriods' && (
                                <RelativePeriodSelect
                                    period={period}
                                    onChange={setPeriod}
                                    style={styles.select}
                                    errorText={periodError}
                                />
                            )}
                            {((periodType &&
                                periodType !== 'relativePeriods' &&
                                periodType !== 'StartEndDates') ||
                                (!periodType && id)) && (
                                <PeriodSelect
                                    periodType={periodType}
                                    period={period}
                                    onChange={setPeriod}
                                    style={styles.select}
                                    errorText={periodError}
                                />
                            )}
                            {periodType === 'StartEndDates' && [
                                <DatePicker
                                    key="startdate"
                                    label={i18n.t('Start date')}
                                    value={startDate}
                                    onChange={setStartDate}
                                    style={styles.select}
                                />,
                                <DatePicker
                                    key="enddate"
                                    label={i18n.t('End date')}
                                    value={endDate}
                                    onChange={setEndDate}
                                    style={styles.select}
                                />,
                                periodError ? (
                                    <div key="error" style={styles.error}>
                                        {periodError}
                                    </div>
                                ) : null,
                            ]}
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <div
                            style={styles.flexColumnFlow}
                            data-test="thematicdialog-orgunitstab"
                        >
                            <div
                                style={{
                                    ...styles.flexColumn,
                                    overflow: 'hidden',
                                }}
                            >
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                    disabled={hasUserOrgUnits}
                                />
                            </div>
                            <div style={styles.flexColumn}>
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
                                {!orgUnits.length && orgUnitsError && (
                                    <div style={styles.error}>
                                        {orgUnitsError}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'filter' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="thematicdialog-filtertab"
                        >
                            <DimensionFilter dimensions={dimensions} />
                        </div>
                    )}
                    {tab === 'style' && (
                        <div
                            style={styles.flexColumnFlow}
                            data-test="thematicdialog-styletab"
                        >
                            <div style={{ ...styles.flexColumn, marginTop: 0 }}>
                                <NumericLegendStyle
                                    dataItem={dataItem}
                                    style={styles.select}
                                />
                                <div style={styles.flexInnerColumnFlow}>
                                    <TextField
                                        id="lowsize"
                                        type="number"
                                        label={i18n.t('Low size')}
                                        value={
                                            radiusLow !== undefined
                                                ? radiusLow
                                                : 5
                                        }
                                        onChange={radius =>
                                            setRadiusLow(radius)
                                        }
                                        style={{
                                            ...styles.flexInnerColumn,
                                            maxWidth: 140,
                                        }}
                                    />
                                    <TextField
                                        id="highsize"
                                        type="number"
                                        label={i18n.t('High size')}
                                        value={
                                            radiusHigh !== undefined
                                                ? radiusHigh
                                                : 15
                                        }
                                        onChange={radius =>
                                            setRadiusHigh(radius)
                                        }
                                        style={{
                                            ...styles.flexInnerColumn,
                                            maxWidth: 140,
                                        }}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Labels')}
                                        checked={labels}
                                        onCheck={setLabels}
                                        style={{
                                            ...styles.flexInnerColumn,
                                            marginLeft: -6,
                                            maxWidth: 150,
                                            paddingTop: 16,
                                            height: 42,
                                        }}
                                    />
                                    {labels && (
                                        <FontStyle
                                            color={labelFontColor}
                                            size={labelFontSize}
                                            weight={labelFontWeight}
                                            fontStyle={labelFontStyle}
                                            onColorChange={setLabelFontColor}
                                            onSizeChange={setLabelFontSize}
                                            onWeightChange={setLabelFontWeight}
                                            onStyleChange={setLabelFontStyle}
                                            style={{
                                                ...styles.flexInnerColumn,
                                                ...styles.font,
                                            }}
                                        />
                                    )}
                                </div>
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

        if (!periodType && !period) {
            return this.setErrorState(
                'periodTypeError',
                i18n.t('Period type is required'),
                'period'
            );
        } else if (!period && periodType !== 'StartEndDates') {
            return this.setErrorState(
                'periodError',
                i18n.t('Period is required'),
                'period'
            );
        } else if (periodType === 'StartEndDates') {
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

        return true;
    }
}

export default connect(
    null,
    {
        setDataItem,
        setDataElementGroup,
        setIndicatorGroup,
        setLabels,
        setLabelFontColor,
        setLabelFontSize,
        setLabelFontWeight,
        setLabelFontStyle,
        setOperand,
        setOrgUnitLevels,
        setOrgUnitGroups,
        setPeriod,
        setPeriodType,
        setStartDate,
        setEndDate,
        setProgram,
        setRadiusLow,
        setRadiusHigh,
        setUserOrgUnits,
        setValueType,
        toggleOrgUnit,
        loadOrgUnitPath,
    },
    null,
    {
        withRef: true,
    }
)(ThematicDialog);
