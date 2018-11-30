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
    getUserOrgUnitsFromRows,
} from '../../../util/analytics';
import { getStartEndDateError } from '../../../util/helpers';

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
            filters,
            startDate,
            endDate,
            setStartDate,
            setEndDate,
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

        // Set default period (last year)
        if (!startDate && !endDate) {
            setStartDate(DEFAULT_START_DATE);
            setEndDate(DEFAULT_END_DATE);
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

        console.log(labelFontColor);

        return (
            <div>
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="data" label={i18n.t('data')} />
                    <Tab value="period" label={i18n.t('period')} />
                    <Tab value="orgunits" label={i18n.t('Org units')} />
                    <Tab value="style" label={i18n.t('Style')} />
                </Tabs>
                <div style={styles.tabContent}>
                    {tab === 'data' && (
                        <div style={styles.flexRowFlow}>
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
                        <div style={styles.flexRowFlow}>
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
                        <div style={styles.flexColumnFlow}>
                            <div
                                style={{
                                    ...styles.flexColumn,
                                    overflow: 'hidden',
                                }}
                            >
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                    disabled={
                                        selectedUserOrgUnits.length
                                            ? true
                                            : false
                                    }
                                />
                            </div>
                            <div style={styles.flexColumn}>
                                <OrgUnitLevelSelect
                                    orgUnitLevel={getOrgUnitLevelsFromRows(
                                        rows
                                    )}
                                    defaultLevel={DEFAULT_ORG_UNIT_LEVEL}
                                    onChange={setOrgUnitLevels}
                                />
                                <OrgUnitGroupSelect
                                    orgUnitGroup={getOrgUnitGroupsFromRows(
                                        rows
                                    )}
                                    onChange={setOrgUnitGroups}
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
                    {tab === 'style' && (
                        <div style={styles.flexColumnFlow}>
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
                                        onChange={(evt, radius) =>
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
                                        onChange={(evt, radius) =>
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
                                            paddingTop: 24,
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
