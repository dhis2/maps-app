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
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect';
import { layerDialogStyles } from '../LayerDialogStyles';
import { dimConf } from '../../../constants/dimension';

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
    static propTypes = {
        onLayerValidation: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    state = {
        tab: 'data',
    };

    componentDidMount() {
        const { valueType, columns, setValueType } = this.props;
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
                setValueType('in'); // TODO: Make constant
            }
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
            orgUnitsError,
            periodTypeError,
            periodError,
        } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const period = getPeriodFromFilters(filters);
        const dataItem = getDataItemFromColumns(columns);

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
                            {(!valueType || valueType === 'in') && [
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
                            {valueType === 'de' && [
                                // Data element
                                <DataElementGroupSelect
                                    key="group"
                                    dataElementGroup={dataElementGroup}
                                    onChange={setDataElementGroup}
                                    style={styles.select}
                                />,
                                dataElementGroup && (
                                    <TotalsDetailsSelect
                                        key="totals"
                                        operand={operand}
                                        onChange={setOperand}
                                        style={styles.select}
                                    />
                                ),
                                operand === true ? (
                                    <DataElementOperandSelect
                                        key="element"
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
                                    />
                                ) : (
                                    <DataElementSelect
                                        key="element"
                                        dataElementGroup={dataElementGroup}
                                        dataElement={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
                                    />
                                ),
                            ]}
                            {valueType === 'ds' && ( // Reporting rates
                                <DataSetsSelect
                                    key="item"
                                    dataSet={dataItem}
                                    onChange={setDataItem}
                                    style={styles.select}
                                />
                            )}
                            {valueType === 'di' && [
                                // Event data items
                                <ProgramSelect
                                    key="program"
                                    program={program}
                                    onChange={setProgram}
                                    style={styles.select}
                                />,
                                program && (
                                    <EventDataItemSelect
                                        key="item"
                                        program={program}
                                        dataItem={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
                                    />
                                ),
                            ]}
                            {valueType === 'pi' && [
                                // Program indicator
                                <ProgramSelect
                                    key="program"
                                    program={program}
                                    onChange={setProgram}
                                    style={styles.select}
                                />,
                                program && (
                                    <ProgramIndicatorSelect
                                        key="indicator"
                                        program={program}
                                        programIndicator={dataItem}
                                        onChange={setDataItem}
                                        style={styles.select}
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
                                periodType !== 'relativePeriods') ||
                                (!periodType && id)) && (
                                <PeriodSelect
                                    periodType={periodType}
                                    period={period}
                                    onChange={setPeriod}
                                    style={styles.select}
                                    errorText={periodError}
                                />
                            )}
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
                                    defaultLevel={2}
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
                                {!orgUnits.length &&
                                    orgUnitsError && (
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
                                        style={styles.flexInnerColumn}
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
                                        style={styles.flexInnerColumn}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Labels')}
                                        checked={labels}
                                        onCheck={setLabels}
                                        style={{
                                            ...styles.flexInnerColumn,
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
            periodType,
            columns,
            rows,
            filters,
        } = this.props;
        const dataItem = getDataItemFromColumns(columns);
        const period = getPeriodFromFilters(filters);

        if (valueType === 'in') {
            // TODO: Use constant
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

        if (!periodType && !period) {
            return this.setErrorState(
                'periodTypeError',
                i18n.t('Period type is required'),
                'period'
            );
        } else if (!period) {
            return this.setErrorState(
                'periodError',
                i18n.t('Period is required'),
                'period'
            );
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
