import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import sortBy from 'lodash/fp/sortBy';
import { Tabs, Tab } from 'd2-ui/lib/tabs/Tabs';
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
import ColorPicker from '../d2-ui/ColorPicker';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import { EVENT_START_DATE, EVENT_END_DATE, EVENT_COLOR, EVENT_RADIUS } from '../../constants/layers';

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
    getOrgUnitNodesFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics';

const styles = {
    tabs: {
        height: 376,
    },
    flex: {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
        padding: 12,
        // overflowY: 'auto',
    },
    flexFull: {
        flex: '100%',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
    },
    flexHalf: {
        flex: '50%',
        boxSizing: 'border-box',
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    flexQuarter: {
        flex: '25%',
        boxSizing: 'border-box',
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
};

export class EventDialog extends Component {

    componentDidMount() {
        const { period, setStartDate, setEndDate } = this.props;

        if (!period) { // Set default period (last year)
            setStartDate(EVENT_START_DATE);
            setEndDate(EVENT_END_DATE);
        }
    }

    render() {
        const {
            programAttributes = [],
            dataElements = [],
            columns = [],
            rows = [],
            filters = [],
            startDate,
            endDate,
            eventCoordinateField,
            eventClustering,
            eventPointColor,
            eventPointRadius,
            styleDataItem,
            method,
            classes,
            colorScale,
            program,
            programStage,
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

        const period = getPeriodFromFilters(filters) || { id: 'START_END_DATES' };
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        // Merge data elements and program attributes, filter out items not supported, and sort the result
        const dataItems = sortBy('name', [ ...programAttributes, ...dataElements ]
            .filter(item => !['FILE_RESOURCE', 'ORGANISATION_UNIT', 'COORDINATE'].includes(item.valueType))
        );

        const coordinateFields = [{
            id: 'event',
            name: i18next.t('Event location'),
        }, ...dataItems.filter(field => field.valueType === 'COORDINATE')];

        return (
            <Tabs style={styles.tabs}>
                <Tab label={i18next.t('data')}>
                    <div style={styles.flex}>
                        <div style={styles.flexFull}>
                            <ProgramSelect
                                program={program}
                                onChange={setProgram}
                                style={styles.flexHalf}
                            />
                            <ProgramStageSelect
                                program={program}
                                programStage={programStage}
                                onChange={setProgramStage}
                                style={styles.flexHalf}
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
                        <SelectField
                            label={i18next.t('Coordinate field')}
                            items={coordinateFields}
                            value={eventCoordinateField || 'event'}
                            onChange={field => setEventCoordinateField(field.id)}
                            style={styles.flexHalf}
                        />
                        <div style={styles.flexHalf}></div>
                    </div>
                </Tab>
                <Tab label={i18next.t('Filter')}>
                    <div style={styles.flex}>
                        <FilterGroup
                            program={program}
                            programStage={programStage}
                            filters={columns.filter(c => c.filter !== undefined)}
                        />
                    </div>
                </Tab>
                <Tab label={i18next.t('Organisation units')}>
                    <div style={styles.flex}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrganisationUnit}
                                disabled={selectedUserOrgUnits.length ? true : false}
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
                <Tab label={i18next.t('Style')}>
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
                                    style={{ width: 32, height: 32 }}
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
                                // items={dataItems}
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
    }
)(EventDialog);
