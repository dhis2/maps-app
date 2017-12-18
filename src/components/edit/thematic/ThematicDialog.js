import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import { Tabs, Tab } from 'd2-ui/lib/tabs/Tabs';
import TextField from 'd2-ui/lib/text-field/TextField';
import ValueTypeSelect from './ValueTypeSelect';
import AggregationTypeSelect from './AggregationTypeSelect';
import Checkbox from '../../d2-ui/Checkbox';
import Classification from '../../style/Classification';
import DataElementGroupSelect  from '../../dataElement/DataElementGroupSelect';
import DataElementSelect  from '../../dataElement/DataElementSelect';
import DataItemSelect from '../../dataItem/DataItemSelect';
import DataSetsSelect from '../../dataSets/DataSetsSelect';
import DummySelectField from '../../d2-ui/DummySelectField';
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
} from '../../../actions/layerEdit';

import {
    getIndicatorFromColumns,
    getOrgUnitGroupsFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitNodesFromRows,
    getPeriodFromFilters,
    getProgramIndicatorFromColumns,
    getReportingRateFromColumns,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics';

const styles = {
    content: { // TODO: reuse styles
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
        padding: 12,
        height: 330,
        overflowY: 'auto',
    },
    flexHalf: {
        flex: '50%',
        minWidth: 230,
        boxSizing: 'border-box',
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    flexThird: {
        flex: '33%',
        minWidth: 230,
        boxSizing: 'border-box',
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    flexFull: {
        flex: '100%',
        display: 'flex',
        flexFlow: 'row wrap',
        // justifyContent: 'space-between',
        alignContent: 'flex-start',
    },
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
};

export class ThematicDialog extends Component {

    componentDidUpdate(prevProps) {
        const { columns, setClassification, setLegendSet } = this.props;

        // Set connected legend set when indicator is selected
        if (columns) {
            const indicator = getIndicatorFromColumns(columns);
            const prevIndicator = getIndicatorFromColumns(prevProps.columns);

            // If user selected indicator with legend set
            if (indicator && indicator !== prevIndicator && indicator.legendSet) {
                setClassification(1); // TODO: Use constant
                setLegendSet(indicator.legendSet);
            }
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

        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const period = getPeriodFromFilters(filters);
        const indicator = getIndicatorFromColumns(columns);

        return (
            <Tabs>
                <Tab label={i18next.t('data')}>
                    <div style={styles.content}>
                        <ValueTypeSelect
                            value={valueType}
                            style={styles.flexHalf}
                        />
                        <div style={styles.flexFull}>
                            {(!valueType || valueType === 'in') && [ // Indicator (default)
                                <IndicatorGroupSelect
                                    key='group'
                                    indicatorGroup={indicatorGroup}
                                    onChange={setIndicatorGroup}
                                    style={styles.flexHalf}
                                />,
                                <GroupIndicatorSelect
                                    key='indicator'
                                    indicatorGroup={indicatorGroup}
                                    indicator={getIndicatorFromColumns(columns)}
                                    onChange={setIndicator}
                                    style={styles.flexHalf}
                                />,
                                (!indicatorGroup && indicator && (
                                    <DummySelectField
                                        key='dummy'
                                        label={i18next.t('Indicator')}
                                        item={indicator}
                                        style={styles.flexHalf}
                                    />
                                ))
                            ]}
                            {valueType === 'pi' && [ // Program indicator
                                <ProgramSelect
                                    key='program'
                                    program={program}
                                    onChange={setProgram}
                                    style={styles.flexHalf}
                                />,
                                <ProgramIndicatorSelect
                                    key='indicator'
                                    program={program}
                                    programIndicator={getProgramIndicatorFromColumns(columns)}
                                    onChange={setProgramIndicator}
                                    style={styles.flexHalf}
                                />
                            ]}
                            {valueType === 'de' && [ // Data element
                                <DataElementGroupSelect
                                    key='group'
                                    dataElementGroup={dataElementGroup}
                                    onChange={setDataElementGroup}
                                    style={styles.flexHalf}
                                />,
                                <DataElementSelect
                                    key='element'
                                    dataElementGroup={dataElementGroup}
                                    onChange={setDataElement}
                                    style={styles.flexHalf}
                                />,
                            ]}
                            {valueType === 'di' && [ // Event data items
                                <ProgramSelect
                                    key='program'
                                    program={program}
                                    onChange={setProgram}
                                    style={styles.flexHalf}
                                />,
                                <DataItemSelect
                                    key='item'
                                    program={program}
                                    // value={styleDataItem ? styleDataItem.id : null}
                                    onChange={console.log}
                                    style={styles.flexHalf}
                                />
                            ]}
                            {valueType === 'ds' && ( // Reporting rates
                                <DataSetsSelect
                                    key='item'
                                    dataSet={getReportingRateFromColumns(columns)}
                                    onChange={setDataSetItem}
                                    style={styles.flexHalf}
                                />
                            )}
                        </div>
                        <PeriodTypeSelect
                            value={periodType}
                            onChange={type => setPeriodType(type.id)}
                            style={styles.flexHalf}
                        />
                        {periodType === 'relativePeriods' &&
                            <RelativePeriodSelect
                                period={period}
                                onChange={setPeriod}
                                style={styles.flexHalf}
                            />
                        }
                        {periodType && periodType !== 'relativePeriods' &&
                            <PeriodSelect
                                periodType={periodType}
                                period={period}
                                onChange={setPeriod}
                                style={styles.flexHalf}
                            />
                        }
                        {period && !periodType &&
                            <DummySelectField
                                label={i18next.t('Period')}
                                item={period}
                                style={styles.flexHalf}
                            />
                        }
                        <AggregationTypeSelect
                            style={styles.flexHalf}
                        />
                    </div>
                </Tab>
                <Tab label={i18next.t('Organisation units')}>
                    <div style={styles.content}>
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
                        </div>
                    </div>
                </Tab>
                <Tab label={i18next.t('Style')}>
                    <div style={styles.content}>
                        <LegendTypeSelect
                            method={method}
                            onChange={setClassification}
                            style={{ ...styles.flexFull, marginTop: 12, marginLeft: 12 }}
                        />
                        {method !== 1 &&
                            <Classification
                                method={method}
                                classes={classes}
                                colorScale={colorScale}
                                style={{ ...styles.flexFull, marginTop: 12, marginLeft: 12 }}
                            />
                        }
                        {method === 1 &&
                            <LegendSetSelect
                                legendSet={legendSet}
                                onChange={setLegendSet}
                                style={{ width: 354, margin: '4px 0 8px 12px' }}
                            />
                        }
                        <div style={{ ...styles.flexFull, marginTop: -12, marginLeft: 12 }}>
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
                        <div style={styles.wrapper}>
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
    }
)(ThematicDialog);

