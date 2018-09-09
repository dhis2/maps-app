import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import ProgramSelect from '../program/ProgramSelect';
import ProgramStageSelect from '../program/ProgramStageSelect';
import RelativePeriodSelect from '../periods/RelativePeriodSelect';
import DatePicker from '../d2-ui/DatePicker';
import Checkbox from '../d2-ui/Checkbox';
import FilterGroup from '../filter/FilterGroup';
import ImageSelect from '../d2-ui/ImageSelect';
import StyleByDataItem from '../dataItem/StyleByDataItem';
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
    checkbox: {
        float: 'left',
        marginTop: 24,
        width: 180,
    },
    radius: {
        width: 110,
        marginTop: 12,
    },
};

export class EventDialog extends Component {
    static propTypes = {
        areaRadius: PropTypes.number,
        columns: PropTypes.array,
        endDate: PropTypes.string,
        eventClustering: PropTypes.bool,
        eventCoordinateField: PropTypes.string,
        eventPointColor: PropTypes.string,
        eventPointRadius: PropTypes.number,
        filters: PropTypes.array,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        rows: PropTypes.array,
        startDate: PropTypes.string,
        setProgram: PropTypes.func.isRequired,
        setProgramStage: PropTypes.func.isRequired,
        setEventCoordinateField: PropTypes.func.isRequired,
        setEventClustering: PropTypes.func.isRequired,
        setEventPointColor: PropTypes.func.isRequired,
        setEventPointRadius: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        setPeriod: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        setEndDate: PropTypes.func.isRequired,
        setAreaRadius: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data',
            showBuffer: this.hasBuffer(props.areaRadius),
        };
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

    componentDidUpdate(prevProps) {
        const { areaRadius } = this.props;

        if (areaRadius !== prevProps.areaRadius) {
            this.setState({
                showBuffer: this.hasBuffer(areaRadius),
            });
        }
    }

    render() {
        const {
            // layer options
            areaRadius,
            columns = [],
            endDate,
            eventClustering,
            eventCoordinateField,
            eventPointColor,
            eventPointRadius,
            filters = [],
            program,
            programStage,
            rows = [],
            startDate,
        } = this.props;

        const {
            // handlers
            setProgram,
            setProgramStage,
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

        const { classes } = this.props;

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

        return (
            <div>
                <Tabs
                    value={tab}
                    onChange={(event, tab) => this.setState({ tab })}

                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                >
                    <Tab value="data" label={i18n.t('data')} className={classes.tab} />
                    <Tab value="period" label={i18n.t('period')} className={classes.tab} />
                    <Tab value="filter" label={i18n.t('Filter')} className={classes.tab} />
                    <Tab value="orgunits" label={i18n.t('Org units')} className={classes.tab} />
                    <Tab value="style" label={i18n.t('Style')} className={classes.tab} />
                </Tabs>
                <div className={classes.tabContent}>
                    {tab === 'data' && 
                        <div style={styles.flexRowFlow}>
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
                    }
                    {tab === 'period' && 
                        <div style={styles.flexRowFlow}>
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
                     }
                    {tab === 'filter' && 
                        <div style={styles.flexRowFlow}>
                            <FilterGroup
                                program={program}
                                programStage={programStage}
                                filters={columns.filter(
                                    c => c.filter !== undefined
                                )}
                            />
                        </div>
                    }
                    {tab === 'orgunits' && 
                        <div style={styles.flexColumnFlow}>
                            <div
                                style={{ ...styles.flexColumn, overflow: 'hidden' }}
                            >
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
                            <div style={styles.flexColumn}>
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
                    }
                    {tab === 'style' && 
                        <div style={styles.flexColumnFlow}>
                            <div style={styles.flexColumn}>
                                <div style={styles.flexInnerColumnFlow}>
                                    <ImageSelect
                                        id="cluster"
                                        img="images/cluster.png"
                                        title={i18n.t('Group events')}
                                        onClick={() => setEventClustering(true)}
                                        isSelected={eventClustering}
                                        style={styles.flexInnerColumn}
                                    />
                                    <ImageSelect
                                        id="nocluster"
                                        img="images/nocluster.png"
                                        title={i18n.t('View all events')}
                                        onClick={() => setEventClustering(false)}
                                        isSelected={!eventClustering}
                                        style={styles.flexInnerColumn}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <ColorPicker
                                        label={i18n.t('Color')}
                                        color={eventPointColor || EVENT_COLOR}
                                        onChange={setEventPointColor}
                                        style={styles.flexInnerColumn}
                                    />
                                    <TextField
                                        id="radius"
                                        type="number"
                                        label={i18n.t('Radius')}
                                        value={eventPointRadius || EVENT_RADIUS}
                                        onChange={(evt, radius) =>
                                            setEventPointRadius(radius)
                                        }
                                        style={styles.flexInnerColumn}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Buffer')}
                                        checked={showBuffer}
                                        onCheck={this.onShowBufferClick.bind(this)}
                                        style={{
                                            ...styles.flexInnerColumn,
                                            marginTop: 47,
                                        }}
                                        disabled={eventClustering}
                                    />
                                    {showBuffer && (
                                        <TextField
                                            id="buffer"
                                            type="number"
                                            label={i18n.t('Radius in meters')}
                                            value={areaRadius || ''}
                                            onChange={(evt, radius) =>
                                                setAreaRadius(radius)
                                            }
                                            style={styles.flexInnerColumn}
                                            // floatingLabelStyle={{
                                            //    whiteSpace: 'nowrap',
                                            //}}
                                            disabled={eventClustering}
                                        />
                                    )}
                                </div>
                            </div>
                            <div style={styles.flexColumn}>
                                {program && <StyleByDataItem />}
                            </div>
                        </div>
                    }
                </div>
            </div> 
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
)(withStyles(styles)(EventDialog));
