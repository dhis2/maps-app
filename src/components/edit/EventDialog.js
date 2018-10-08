import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
// import { TextField } from '@dhis2/d2-ui-core'; // TODO: Don't accept numbers as values
import TextField from 'material-ui/TextField';
import ProgramSelect from '../program/ProgramSelect';
import ProgramStageSelect from '../program/ProgramStageSelect';
import RelativePeriodSelect from '../periods/RelativePeriodSelect';
import DatePicker from '../d2-ui/DatePicker';
import Checkbox from '../d2-ui/Checkbox';
import FilterGroup from '../filter/FilterGroup';
import ImageSelect from '../d2-ui/ImageSelect';
import DataItemSelect from '../dataItem/DataItemSelect';
import DataItemStyle from '../dataItem/DataItemStyle';
import CoordinateField from '../dataItem/CoordinateField';
import ColorPicker from '../d2-ui/ColorPicker';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import SelectedOrgUnits from '../orgunits/SelectedOrgUnits';
import {
    EVENT_START_DATE,
    EVENT_END_DATE,
    EVENT_COLOR,
    EVENT_RADIUS,
    EVENT_BUFFER,
} from '../../constants/layers';
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
    toggleOrgUnit,
    setPeriod,
    setStartDate,
    setEndDate,
    setAreaRadius,
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
    },
    image: {
        width: '50%',
        float: 'left',
        boxSizing: 'border-box',
        padding: '12px 12px 0 3px',
    },
    checkbox: {
        float: 'left',
        marginTop: 24,
        width: 180,
    },
    radius: {
        width: 110,
        marginTop: 12,
    },
    buffer: {
        marginTop: 12,
    },
};

export class EventDialog extends Component {
    static propTypes = {
        classes: PropTypes.number,
        columns: PropTypes.array,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data',
            showBuffer: this.hasBuffer(props.areaRadius),
        };
    }

    componentWillReceiveProps({ areaRadius }) {
        if (areaRadius !== this.props.areaRadius) {
            this.setState({
                showBuffer: this.hasBuffer(areaRadius),
            });
        }
    }

    componentDidMount() {
        const {
            filters,
            startDate,
            endDate,
            setStartDate,
            setEndDate,
        } = this.props;
        const period = getPeriodFromFilters(filters);

        if (!period && !startDate && !endDate) {
            // Set default period (last year)
            setStartDate(EVENT_START_DATE);
            setEndDate(EVENT_END_DATE);
        }
    }

    render() {
        const {
            // layer options
            classes,
            columns = [],
            colorScale,
            endDate,
            eventClustering,
            eventCoordinateField,
            eventPointColor,
            eventPointRadius,
            filters = [],
            method,
            program,
            programStage,
            rows = [],
            startDate,
            styleDataItem,
            areaRadius,
        } = this.props;

        const {
            // handlers
            setProgram,
            setProgramStage,
            setStyleDataItem,
            setEventCoordinateField,
            setEventClustering,
            setEventPointColor,
            setEventPointRadius,
            setUserOrgUnits,
            toggleOrgUnit,
            setPeriod,
            setStartDate,
            setEndDate,
            setAreaRadius,
        } = this.props;

        const {
            tab,
            programError,
            programStageError,
            orgUnitsError,
            showBuffer,
        } = this.state;

        const period = getPeriodFromFilters(filters) || {
            id: 'START_END_DATES',
        };
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const allowStyleByDataItem = false; // TODO: Remove check

        return (
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={tab => this.setState({ tab })}
            >
                <Tab value="data" label={i18n.t('data')}>
                    <div style={styles.flexColumnFlow}>
                        <ProgramSelect
                            program={program}
                            onChange={setProgram}
                            style={styles.select}
                            errorText={programError}
                        />
                        <ProgramStageSelect
                            program={program}
                            programStage={programStage}
                            onChange={setProgramStage}
                            style={styles.select}
                            errorText={programStageError}
                        />
                        <CoordinateField
                            program={program}
                            programStage={programStage}
                            value={eventCoordinateField}
                            onChange={setEventCoordinateField}
                            style={styles.select}
                        />
                    </div>
                </Tab>
                <Tab value="period" label={i18n.t('period')}>
                    <div style={styles.flexColumnFlow}>
                        <RelativePeriodSelect
                            period={period}
                            startEndDates={true}
                            onChange={setPeriod}
                            style={styles.select}
                        />
                        {period.id === 'START_END_DATES' && [
                            <DatePicker
                                key="startdate"
                                label={i18n.t('Start date')}
                                value={startDate}
                                default={EVENT_START_DATE}
                                onChange={setStartDate}
                                style={styles.select}
                            />,
                            <DatePicker
                                key="enddate"
                                label={i18n.t('End date')}
                                value={endDate}
                                default={EVENT_END_DATE}
                                onChange={setEndDate}
                                style={styles.select}
                            />,
                        ]}
                    </div>
                </Tab>
                <Tab value="filter" label={i18n.t('Filter')}>
                    <div style={styles.flex}>
                        <FilterGroup
                            program={program}
                            programStage={programStage}
                            filters={columns.filter(
                                c => c.filter !== undefined
                            )}
                        />
                    </div>
                </Tab>
                <Tab value="orgunits" label={i18n.t('Org units')}>
                    <div style={styles.flexRowFlow}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrgUnit}
                                disabled={
                                    selectedUserOrgUnits.length ? true : false
                                }
                                selectRootAsDefault={
                                    getOrgUnitsFromRows(rows).length === 0
                                }
                            />
                        </div>
                        <div style={styles.flexHalf}>
                            <UserOrgUnitsSelect
                                selected={selectedUserOrgUnits}
                                onChange={setUserOrgUnits}
                            />
                            <SelectedOrgUnits
                                rows={rows}
                                units={i18n.t('Events')}
                                error={orgUnitsError}
                            />
                        </div>
                    </div>
                </Tab>
                <Tab value="style" label={i18n.t('Style')}>
                    <div style={styles.flexColumnFlow}>
                        <div style={{ ...styles.select, height: 140 }}>
                            <ImageSelect
                                id="cluster"
                                img="images/cluster.png"
                                title={i18n.t('Group events')}
                                onClick={() => setEventClustering(true)}
                                isSelected={eventClustering}
                                style={styles.image}
                            />
                            <ImageSelect
                                id="nocluster"
                                img="images/nocluster.png"
                                title={i18n.t('View all events')}
                                onClick={() => setEventClustering(false)}
                                isSelected={!eventClustering}
                                style={styles.image}
                            />
                        </div>
                        <div style={{ marginLeft: 3 }}>
                            <div
                                style={{
                                    marginTop: 20,
                                    marginRight: 20,
                                    float: 'left',
                                }}
                            >
                                <div style={styles.colorLabel}>
                                    {i18n.t('Color')}
                                </div>
                                <ColorPicker
                                    color={eventPointColor || EVENT_COLOR}
                                    onChange={setEventPointColor}
                                    style={{ width: 64, height: 32 }}
                                />
                            </div>
                            <TextField
                                id="radius"
                                type="number"
                                floatingLabelText={i18n.t('Radius')}
                                value={eventPointRadius || EVENT_RADIUS}
                                onChange={(evt, radius) =>
                                    setEventPointRadius(radius)
                                }
                                style={{
                                    float: 'left',
                                    maxWidth: 100,
                                    marginTop: 0,
                                }}
                            />
                        </div>
                        <div style={styles.buffer}>
                            <Checkbox
                                label={i18n.t('Show buffer')}
                                checked={showBuffer}
                                onCheck={this.onShowBufferClick.bind(this)}
                                style={styles.checkbox}
                                disabled={eventClustering}
                            />
                            {showBuffer && (
                                <TextField
                                    id="buffer"
                                    type="number"
                                    floatingLabelText={i18n.t(
                                        'Radius in meters'
                                    )}
                                    value={areaRadius || ''}
                                    onChange={(evt, radius) =>
                                        setAreaRadius(radius)
                                    }
                                    style={{
                                        float: 'left',
                                        maxWidth: 150,
                                        marginTop: -20,
                                    }}
                                    disabled={eventClustering}
                                />
                            )}
                        </div>
                        {allowStyleByDataItem && [
                            // TODO: Remove check
                            <DataItemSelect
                                label={i18n.t('Style by data item')}
                                program={program}
                                programStage={programStage}
                                allowNone={true}
                                value={styleDataItem ? styleDataItem.id : null}
                                onChange={setStyleDataItem}
                                style={styles.select}
                            />,
                            <DataItemStyle
                                method={method}
                                classes={classes}
                                colorScale={colorScale}
                                style={styles.select}
                                {...styleDataItem}
                            />,
                        ]}
                    </div>
                </Tab>
            </Tabs>
        );
    }

    onShowBufferClick(isChecked) {
        const { setAreaRadius, areaRadius } = this.props;
        setAreaRadius(isChecked ? areaRadius || EVENT_BUFFER : null);
    }

    hasBuffer(areaRadius) {
        return areaRadius !== undefined && areaRadius !== null;
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
        const { program, programStage, rows } = this.props;

        if (!program) {
            return this.setErrorState(
                'programError',
                i18n.t('Program is required'),
                'data'
            );
        }

        if (!programStage) {
            return this.setErrorState(
                'programStageError',
                i18n.t('Program stage is required'),
                'data'
            );
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected.'),
                'orgunits'
            );
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
        toggleOrgUnit,
        setPeriod,
        setStartDate,
        setEndDate,
        setAreaRadius,
    },
    null,
    {
        withRef: true,
    }
)(EventDialog);
