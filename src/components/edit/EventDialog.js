import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Tabs from '../core/Tabs';
import Tab from '../core/Tab';
import TextField from '../core/TextField';
import ProgramSelect from '../program/ProgramSelect';
import ProgramStageSelect from '../program/ProgramStageSelect';
import RelativePeriodSelect from '../periods/RelativePeriodSelect';
import DatePicker from '../core/DatePicker';
import Checkbox from '../core/Checkbox';
import FilterGroup from '../filter/FilterGroup';
import ImageSelect from '../core/ImageSelect';
import StyleByDataItem from '../dataItem/StyleByDataItem';
import CoordinateField from '../dataItem/CoordinateField';
import ColorPicker from '../core/ColorPicker';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import SelectedOrgUnits from '../orgunits/SelectedOrgUnits';
import {
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
    setOrgUnitRoot,
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
import { getStartEndDateError } from '../../util/time';
import { cssColor } from '../../util/colors';

// TODO: Don't use inline styles!
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
    text: {
        paddingTop: 8,
        lineHeight: '22px',
    },
    error: {
        marginTop: 10,
        color: 'red',
    },
};

export class EventDialog extends Component {
    static propTypes = {
        areaRadius: PropTypes.number,
        columns: PropTypes.array,
        defaultPeriod: PropTypes.string,
        endDate: PropTypes.string,
        eventClustering: PropTypes.bool,
        eventCoordinateField: PropTypes.string,
        eventPointColor: PropTypes.string,
        eventPointRadius: PropTypes.number,
        filters: PropTypes.array,
        onLayerValidation: PropTypes.func.isRequired,
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
        setOrgUnitRoot: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        setPeriod: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        setEndDate: PropTypes.func.isRequired,
        setAreaRadius: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data',
            showBuffer: this.hasBuffer(props.areaRadius),
        };
    }

    componentDidMount() {
        const { rows, filters, defaultPeriod, setOrgUnitRoot } = this.props;

        const orgUnits = getOrgUnitNodesFromRows(rows);
        const period = getPeriodFromFilters(filters);

        // Set org unit tree root as default
        if (orgUnits.length === 0) {
            setOrgUnitRoot();
        }

        // Set default period from system settings
        if (!period && defaultPeriod) {
            setPeriod({
                id: defaultPeriod,
            });
        }
    }

    componentDidUpdate(prev) {
        const { areaRadius, validateLayer, onLayerValidation } = this.props;

        if (areaRadius !== prev.areaRadius) {
            this.setState({
                showBuffer: this.hasBuffer(areaRadius),
            });
        }

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate());
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

        const {
            tab,
            programError,
            programStageError,
            periodError,
            orgUnitsError,
            showBuffer,
        } = this.state;

        const period = getPeriodFromFilters(filters) || {
            id: 'START_END_DATES',
        };

        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        return (
            <div data-test="eventdialog">
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="data" label={i18n.t('data')} />
                    <Tab value="period" label={i18n.t('period')} />
                    <Tab value="orgunits" label={i18n.t('Org units')} />
                    <Tab value="filter" label={i18n.t('Filter')} />
                    <Tab value="style" label={i18n.t('Style')} />
                </Tabs>
                <div style={styles.tabContent} data-test="eventdialog-content">
                    {tab === 'data' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="eventdialog-datatab"
                        >
                            <ProgramSelect
                                program={program}
                                onChange={setProgram}
                                style={styles.select}
                                errorText={programError}
                                data-test="eventdialog-programselect"
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
                    )}
                    {tab === 'period' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="eventdialog-periodtab"
                        >
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
                            ]}
                            {periodError ? (
                                <div key="error" style={styles.error}>
                                    {periodError}
                                </div>
                            ) : null}
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <div
                            style={styles.flexColumnFlow}
                            data-test="eventdialog-orgunittab"
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
                                    disabled={
                                        selectedUserOrgUnits.length
                                            ? true
                                            : false
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
                    )}
                    {tab === 'filter' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="eventdialog-filtertab"
                        >
                            <FilterGroup
                                program={program}
                                programStage={programStage}
                                filters={columns.filter(
                                    c => c.filter !== undefined
                                )}
                            />
                        </div>
                    )}
                    {tab === 'style' && (
                        <div
                            style={styles.flexColumnFlow}
                            data-test="eventdialog-styletab"
                        >
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
                                        onClick={() =>
                                            setEventClustering(false)
                                        }
                                        isSelected={!eventClustering}
                                        style={styles.flexInnerColumn}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <ColorPicker
                                        label={i18n.t('Color')}
                                        color={
                                            cssColor(eventPointColor) ||
                                            EVENT_COLOR
                                        }
                                        onChange={setEventPointColor}
                                        style={styles.flexInnerColumn}
                                    />
                                    <TextField
                                        id="radius"
                                        type="number"
                                        label={i18n.t('Radius')}
                                        value={eventPointRadius || EVENT_RADIUS}
                                        onChange={setEventPointRadius}
                                        style={styles.flexInnerColumn}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Buffer')}
                                        checked={showBuffer}
                                        onCheck={this.onShowBufferClick.bind(
                                            this
                                        )}
                                        style={styles.flexInnerColumn}
                                        disabled={eventClustering}
                                    />
                                    {showBuffer && (
                                        <TextField
                                            id="buffer"
                                            type="number"
                                            label={i18n.t('Radius in meters')}
                                            value={areaRadius || ''}
                                            onChange={setAreaRadius}
                                            style={styles.flexInnerColumn}
                                            disabled={eventClustering}
                                        />
                                    )}
                                </div>
                            </div>
                            <div style={styles.flexColumn}>
                                {program ? (
                                    <StyleByDataItem />
                                ) : (
                                    <div style={styles.text}>
                                        {i18n.t(
                                            'You can style events by data element after selecting a program.'
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
        const {
            program,
            programStage,
            rows,
            filters,
            startDate,
            endDate,
        } = this.props;
        const period = getPeriodFromFilters(filters) || {
            id: 'START_END_DATES',
        }; // TODO: refactor

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

        if (period.id === 'START_END_DATES') {
            const error = getStartEndDateError(startDate, endDate);
            if (error) {
                return this.setErrorState('periodError', error, 'period');
            }
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
        setOrgUnitRoot,
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
