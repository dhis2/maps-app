import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
// import { Tabs, Tab } from 'd2-ui/lib/tabs/Tabs';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'd2-ui/lib/text-field/TextField';
import ValueTypeSelect from './ValueTypeSelect';
import AggregationTypeSelect from './AggregationTypeSelect';
import Checkbox from '../../d2-ui/Checkbox';
import Classification from '../../style/Classification';
import DataElementGroupSelect  from '../../dataElement/DataElementGroupSelect';
import DataElementSelect  from '../../dataElement/DataElementSelect';
import DataItemSelect from '../../dataItem/DataItemSelect';
import DataSetsSelect from '../../dataSets/DataSetsSelect';
import FontStyle from '../../d2-ui/FontStyle';
import IndicatorGroupSelect from '../../indicator/IndicatorGroupSelect';
import LegendSetSelect from '../../legendSet/LegendSetSelect';
import LegendTypeSelect from './LegendTypeSelect';
import GroupIndicatorSelect from '../../indicator/GroupIndicatorSelect';
import OrgUnitGroupSelect from '../../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../../orgunits/OrgUnitLevelSelect';
import OrgUnitTree from '../../orgunits/OrgUnitTree';
import PeriodSelect from '../../periods/PeriodSelect';
import PeriodTypeSelect from '../../periods/PeriodTypeSelect';
import ProgramSelect from '../../program/ProgramSelect';
import ProgramIndicatorSelect from '../../program/ProgramIndicatorSelect';
import RelativePeriodSelect from '../../periods/RelativePeriodSelect';
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect';
import { layerDialogStyles } from '../LayerDialogStyles';

import {
    setClassification,
    setDataElement,
    setDataElementGroup,
    setDataSetItem,
    setIndicator,
    setIndicatorGroup,
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
    setLegendSet,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setPeriod,
    setPeriodType,
    setProgram,
    setProgramIndicator,
    setRadiusLow,
    setRadiusHigh,
    setUserOrgUnits,
    toggleOrganisationUnit,
    loadOrgUnitPath,
} from '../../../actions/layerEdit';

import {
    getIndicatorFromColumns,
    getOrgUnitsFromRows,
    getOrgUnitGroupsFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitNodesFromRows,
    getPeriodFromFilters,
    getProgramIndicatorFromColumns,
    getReportingRateFromColumns,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics';

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
        marginTop: -8,
    },
    error: {
        marginTop: 10,
        color: 'red',
    },
};

export class ThematicDialog extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data'
        };
    }

    componentDidUpdate(prevProps) {
        const { columns, rows, setClassification, setLegendSet, loadOrgUnitPath } = this.props;

        // Set connected legend set when indicator is selected
        if (columns) {
            const indicator = getIndicatorFromColumns(columns);
            const prevIndicator = getIndicatorFromColumns(prevProps.columns);

            // If user selected indicator with legend set
            if (indicator && indicator !== prevIndicator && indicator.legendSet) {
                setClassification(1); // TODO: Use constant
                setLegendSet(indicator.legendSet);
            } else {
                setClassification(2); // TODO: Use constant

            }
        }

        if (rows) {
            const orgUnits = getOrgUnitNodesFromRows(rows);

            // Load organisation unit tree path (temporary solution, as favorites don't include paths)
            orgUnits.filter(ou => !ou.path).forEach(ou => loadOrgUnitPath(ou.id));
        }
    }

    render() {
        const { // layer options
            classes,
            colorScale,
            columns,
            dataElementGroup,
            filters,
            indicatorGroup,
            labels,
            labelFontColor,
            labelFontSize,
            labelFontStyle,
            labelFontWeight,
            legendSet,
            method,
            periodType,
            program,
            radiusHigh,
            radiusLow,
            rows,
            valueType,
        } = this.props;

        const { // Handlers
            setClassification,
            setDataElement,
            setDataElementGroup,
            setDataSetItem,
            setIndicator,
            setIndicatorGroup,
            setLabels,
            setLabelFontColor,
            setLabelFontSize,
            setLabelFontWeight,
            setLabelFontStyle,
            setLegendSet,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setPeriod,
            setPeriodType,
            setProgram,
            setProgramIndicator,
            setRadiusLow,
            setRadiusHigh,
            setUserOrgUnits,
            toggleOrganisationUnit,
        } = this.props;

        const {
            tab,
            orgUnitsError,
            periodTypeError,
            periodError,
        } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const period = getPeriodFromFilters(filters);
        const indicator = getIndicatorFromColumns(columns);

        return (
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={(tab) => this.setState({ tab })}
            >
                <Tab value='data' label={i18next.t('data')}>
                    <div style={styles.flexColumnFlow}>
                        <ValueTypeSelect
                            value={valueType}
                            style={styles.select}
                        />
                        {(!valueType || valueType === 'in') && [ // Indicator (default)
                            <IndicatorGroupSelect
                                key='group'
                                indicatorGroup={indicatorGroup}
                                onChange={setIndicatorGroup}
                                style={styles.select}
                            />,
                            <GroupIndicatorSelect
                                key='indicator'
                                indicatorGroup={indicatorGroup}
                                indicator={getIndicatorFromColumns(columns)}
                                onChange={setIndicator}
                                style={styles.select}
                            />,
                            (!indicatorGroup && indicator && (
                                <DummySelectField
                                    key='dummy'
                                    label={i18next.t('Indicator')}
                                    item={indicator}
                                    style={styles.select}
                                />
                            ))
                        ]}
                        {valueType === 'pi' && [ // Program indicator
                            <ProgramSelect
                                key='program'
                                program={program}
                                onChange={setProgram}
                                style={styles.select}
                            />,
                            <ProgramIndicatorSelect
                                key='indicator'
                                program={program}
                                programIndicator={getProgramIndicatorFromColumns(columns)}
                                onChange={setProgramIndicator}
                                style={styles.select}
                            />
                        ]}
                        {valueType === 'de' && [ // Data element
                            <DataElementGroupSelect
                                key='group'
                                dataElementGroup={dataElementGroup}
                                onChange={setDataElementGroup}
                                style={styles.select}
                            />,
                            <DataElementSelect
                                key='element'
                                dataElementGroup={dataElementGroup}
                                onChange={setDataElement}
                                style={styles.select}
                            />,
                        ]}
                        {valueType === 'di' && [ // Event data items
                            <ProgramSelect
                                key='program'
                                program={program}
                                onChange={setProgram}
                                style={styles.select}
                            />,
                            <DataItemSelect
                                key='item'
                                program={program}
                                // value={styleDataItem ? styleDataItem.id : null}
                                onChange={console.log}
                                style={styles.select}
                            />
                        ]}
                        {valueType === 'ds' && ( // Reporting rates
                            <DataSetsSelect
                                key='item'
                                dataSet={getReportingRateFromColumns(columns)}
                                onChange={setDataSetItem}
                                style={styles.select}
                            />
                        )}
                        <AggregationTypeSelect
                            style={styles.select}
                        />
                    </div>
                </Tab>
                <Tab value='period' label={i18next.t('period')}>
                    <div style={styles.flexColumnFlow}>
                        <PeriodTypeSelect
                            value={periodType}
                            onChange={type => setPeriodType(type.id)}
                            style={styles.select}
                            errorText={periodTypeError}
                        />
                        {periodType === 'relativePeriods' &&
                            <RelativePeriodSelect
                                period={period}
                                onChange={setPeriod}
                                style={styles.select}
                                errorText={periodError}
                            />
                        }
                        {periodType && periodType !== 'relativePeriods' &&
                            <PeriodSelect
                                periodType={periodType}
                                period={period}
                                onChange={setPeriod}
                                style={styles.select}
                                errorText={periodError}
                            />
                        }
                    </div>
                </Tab>
                <Tab value='orgunits' label={i18next.t('Org units')}>
                    <div style={styles.flex}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrganisationUnit}
                                disabled={selectedUserOrgUnits.length ? true : false}
                            />
                        </div>
                        <div style={styles.flexHalf}>
                            <OrgUnitLevelSelect
                                orgUnitLevel={getOrgUnitLevelsFromRows(rows)}
                                defaultLevel={2}
                                onChange={setOrgUnitLevels}
                            />
                            <OrgUnitGroupSelect
                                orgUnitGroup={getOrgUnitGroupsFromRows(rows)}
                                onChange={setOrgUnitGroups}
                            />
                            <UserOrgUnitsSelect
                                selected={selectedUserOrgUnits}
                                onChange={setUserOrgUnits}
                            />
                            {!orgUnits.length && orgUnitsError &&
                                <div style={styles.error}>{orgUnitsError}</div>
                            }
                        </div>
                    </div>
                </Tab>
                <Tab value='style' label={i18next.t('Style')}>
                    <div style={styles.flexColumnFlow}>
                        <LegendTypeSelect
                            method={method}
                            onChange={setClassification}
                            style={{ ...styles.select, marginTop: 12 }}
                        />
                        {method !== 1 &&
                            <Classification
                                method={method}
                                classes={classes}
                                colorScale={colorScale}
                                style={{ ...styles.select, marginTop: 12 }}
                            />
                        }
                        {method === 1 &&
                            <LegendSetSelect
                                legendSet={legendSet}
                                onChange={setLegendSet}
                                style={{ ...styles.select, marginTop: 4 }}
                                // style={{ width: 354, margin: '4px 0 8px 12px' }}
                            />
                        }
                        <div style={{ ...styles.flexFull, marginTop: -12, marginLeft: -12 }}>
                            <TextField
                                type='number'
                                label={i18next.t('Low size')}
                                value={radiusLow !== undefined ? radiusLow : 5}
                                onChange={setRadiusLow}
                                style={{ width: 125, marginRight: 24 }}
                            />
                            <TextField
                                type='number'
                                label={i18next.t('High size')}
                                value={radiusHigh !== undefined ? radiusHigh : 15}
                                onChange={setRadiusHigh}
                                style={{ width: 125 }}
                            />
                        </div>
                        <div style={{ ...styles.wrapper, marginLeft: -12 }}>
                            <Checkbox
                                label={i18next.t('Show labels')}
                                checked={labels}
                                onCheck={setLabels}
                                style={styles.checkbox}
                            />
                            {labels &&
                                <FontStyle
                                    color={labelFontColor}
                                    size={labelFontSize}
                                    weight={labelFontWeight}
                                    fontStyle={labelFontStyle}
                                    onColorChange={setLabelFontColor}
                                    onSizeChange={setLabelFontSize}
                                    onWeightChange={setLabelFontWeight}
                                    onStyleChange={setLabelFontStyle}
                                    style={styles.font}
                                />
                            }
                        </div>
                    </div>
                </Tab>
            </Tabs>
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
        const { periodType, filters, rows } = this.props;
        const period = getPeriodFromFilters(filters);
        const orgUnits = getOrgUnitsFromRows(rows);

        if (!periodType) {
            return this.setErrorState('periodTypeError', i18next.t('Period type is required'), 'period');
        } else if (!period) {
            return this.setErrorState('periodError', i18next.t('Period is required'), 'period');
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState('orgUnitsError', i18next.t('No organisation units are selected'), 'orgunits');
        }

        return true;
    }
}

export default connect(
    null,
    {
        setClassification,
        setDataElement,
        setDataElementGroup,
        setDataSetItem,
        setIndicator,
        setIndicatorGroup,
        setLabels,
        setLabelFontColor,
        setLabelFontSize,
        setLabelFontWeight,
        setLabelFontStyle,
        setLegendSet,
        setOrgUnitLevels,
        setOrgUnitGroups,
        setPeriod,
        setPeriodType,
        setProgram,
        setProgramIndicator,
        setRadiusLow,
        setRadiusHigh,
        setUserOrgUnits,
        toggleOrganisationUnit,
        loadOrgUnitPath,
    },
    null,
    {
        withRef: true,
    }
)(ThematicDialog);

