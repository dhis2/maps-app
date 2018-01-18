import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import sortBy from 'lodash/fp/sortBy';
// import { Tabs, Tab } from 'd2-ui/lib/tabs/Tabs'; // Not supporting state change
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'd2-ui/lib/text-field/TextField';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import ProgramSelect from '../program/ProgramSelect';
import ProgramStageSelect from '../program/ProgramStageSelect';
import RelativePeriodSelect from '../periods/RelativePeriodSelect';
import DatePicker from '../d2-ui/DatePicker';
import FilterGroup from '../filter/FilterGroup';
import ImageSelect from '../d2-ui/ImageSelect';
import DataItemSelect from '../dataItem/DataItemSelect';
import DataItemStyle from '../dataItem/DataItemStyle';
import CoordinateField from '../dataItem/CoordinateField';
import ColorPicker from '../d2-ui/ColorPicker';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import { EVENT_START_DATE, EVENT_END_DATE, EVENT_COLOR, EVENT_RADIUS } from '../../constants/layers';
import { layerDialogStyles } from './LayerDialogStyles';

import {
    setProgram,
    setProgramStage,
    setStyleDataItem,
    setEventCoordinateField,
    setEventClustering,
    setEventPointColor,
    setEventPointRadius,
    setUserOrgUnits,
    toggleOrganisationUnit,
    setPeriod,
    setStartDate,
    setEndDate,
} from '../../actions/layerEdit';

import {
    getPeriodFromFilters,
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics';

const styles = {
    ...layerDialogStyles,
    colorLabel: {
        color: 'rgba(0, 0, 0, 0.3)',
        fontSize: 12,
        paddingBottom: 6,
        marginTop: -2,
    }
};

export class EventDialog extends Component {

    static propTypes = {
        classes: PropTypes.number,
        columns: PropTypes.array,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data'
        };
    }

    componentDidMount() {
        const { filters, startDate, endDate, setStartDate, setEndDate } = this.props;
        const period = getPeriodFromFilters(filters);

        if (!period && !startDate && !endDate) { // Set default period (last year)
            setStartDate(EVENT_START_DATE);
            setEndDate(EVENT_END_DATE);
        }
    }

    render() {
        const { // layer options
            classes,
            columns = [],
            colorScale,
            dataElements = [],
            endDate,
            eventClustering,
            eventCoordinateField,
            eventPointColor,
            eventPointRadius,
            filters = [],
            method,
            program,
            programAttributes = [],
            programStage,
            rows = [],
            startDate,
            styleDataItem,
        } = this.props;

        const { // handlers
            setProgram,
            setProgramStage,
            setStyleDataItem,
            setEventCoordinateField,
            setEventClustering,
            setEventPointColor,
            setEventPointRadius,
            setUserOrgUnits,
            toggleOrganisationUnit,
            setPeriod,
            setStartDate,
            setEndDate,
        } = this.props;

        const {
            tab,
            programError,
            programStageError,
        } = this.state;

        const period = getPeriodFromFilters(filters) || { id: 'START_END_DATES' };
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        return (
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={(tab) => this.setState({ tab })}
            >
                <Tab value='data' label={i18next.t('data')}>
                    <div style={styles.flex}>
                        <div style={styles.flexRow}>
                            <ProgramSelect
                                program={program}
                                onChange={setProgram}
                                style={styles.flexHalf}
                                errorText={programError}
                            />
                            <ProgramStageSelect
                                program={program}
                                programStage={programStage}
                                onChange={setProgramStage}
                                style={styles.flexHalf}
                                errorText={programStageError}
                            />
                        </div>
                        <RelativePeriodSelect
                            period={period}
                            startEndDates={true}
                            onChange={setPeriod}
                            style={styles.flexHalf}
                        />
                        {period.id === 'START_END_DATES' && [
                            <DatePicker
                                key='startdate'
                                label={i18next.t('Start date')}
                                value={startDate}
                                default={EVENT_START_DATE}
                                onChange={setStartDate}
                                style={styles.flexQuarter}
                                // textFieldStyle={styles.dateField}
                            />,
                            <DatePicker
                                key='enddate'
                                label={i18next.t('End date')}
                                value={endDate}
                                default={EVENT_END_DATE}
                                onChange={setEndDate}
                                style={styles.flexQuarter}
                                // textFieldStyle={styles.dateField}
                            />
                        ]}
                        <CoordinateField
                            program={program}
                            programStage={programStage}
                            value={eventCoordinateField}
                            onChange={setEventCoordinateField}
                            style={styles.flexHalf}
                        />
                        <div style={styles.flexHalf}></div>
                    </div>
                </Tab>
                <Tab value='filter' label={i18next.t('Filter')}>
                    <div style={styles.flex}>
                        <FilterGroup
                            program={program}
                            programStage={programStage}
                            filters={columns.filter(c => c.filter !== undefined)}
                        />
                    </div>
                </Tab>
                <Tab value='orgunits' label={i18next.t('Organisation units')}>
                    <div style={styles.flex}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrganisationUnit}
                                disabled={selectedUserOrgUnits.length ? true : false}
                                selectRootAsDefault={getOrgUnitsFromRows(rows).length === 0}
                            />
                        </div>
                        <div style={styles.flexHalf}>
                            <UserOrgUnitsSelect
                                selected={selectedUserOrgUnits}
                                onChange={setUserOrgUnits}
                            />
                        </div>
                    </div>
                </Tab>
                <Tab value='style' label={i18next.t('Style')}>
                    <div style={styles.flex}>
                        <div style={{ ...styles.flex, ...styles.flexHalf }}>
                            <ImageSelect
                                id='cluster'
                                img='images/cluster.png'
                                title={i18next.t('Group events')}
                                onClick={() => setEventClustering(true)}
                                isSelected={eventClustering}
                                style={styles.flexHalf}
                            />
                            <ImageSelect
                                id='nocluster'
                                img='images/nocluster.png'
                                title={i18next.t('View all events')}
                                onClick={() => setEventClustering(false)}
                                isSelected={!eventClustering}
                                style={styles.flexHalf}
                            />
                            <div style={{ ...styles.flexHalf, marginTop: 20  }}>
                                <div style={styles.colorLabel}>{i18next.t('Color')}</div>
                                <ColorPicker
                                    color={eventPointColor || EVENT_COLOR}
                                    onChange={setEventPointColor}
                                    style={{ width: 64, height: 32 }}
                                />
                            </div>
                            <TextField
                                type='number'
                                label={i18next.t('Radius')}
                                value={eventPointRadius || EVENT_RADIUS}
                                onChange={setEventPointRadius}
                                style={styles.flexHalf}
                            />
                        </div>
                        <div style={styles.flexHalf}>
                            <DataItemSelect
                                label={i18next.t('Style by data item')}
                                program={program}
                                programStage={programStage}
                                allowNone={true}
                                value={styleDataItem ? styleDataItem.id : null}
                                onChange={setStyleDataItem}
                                style={styles.flexHalf}
                            />
                            <DataItemStyle
                                method={method}
                                classes={classes}
                                colorScale={colorScale}
                                style={styles.flexHalf}
                                {...styleDataItem}
                            />
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
        const { program, programStage } = this.props;

        if (!program) {
            return this.setErrorState('programError', i18next.t('Program is required'), 'data');
        }

        if (!programStage) {
            return this.setErrorState('programStageError', i18next.t('Program stage is required'), 'data');
        }

        return true;
    }

}

export default connect(
    null,
    {
        setProgram,
        setProgramStage,
        setStyleDataItem,
        setEventCoordinateField,
        setEventClustering,
        setEventPointColor,
        setEventPointRadius,
        setUserOrgUnits,
        toggleOrganisationUnit,
        setPeriod,
        setStartDate,
        setEndDate,
    },
    null,
    {
        withRef: true,
    }
)(EventDialog);
