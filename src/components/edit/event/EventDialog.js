import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { NoticeBox } from '@dhis2/ui';
import {
    Tab,
    Tabs,
    NumberField,
    Checkbox,
    ImageSelect,
    ColorPicker,
} from '../../core';
import ProgramSelect from '../../program/ProgramSelect';
import ProgramStageSelect from '../../program/ProgramStageSelect';
import EventStatusSelect from './EventStatusSelect';
import RelativePeriodSelect from '../../periods/RelativePeriodSelect';
import StartEndDates from '../../periods/StartEndDates';
import FilterGroup from '../../filter/FilterGroup';
import StyleByDataItem from '../../dataItem/StyleByDataItem';
import CoordinateField from '../../dataItem/CoordinateField';
import OrgUnitTree from '../../orgunits/OrgUnitTree';
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect';
import SelectedOrgUnits from '../../orgunits/SelectedOrgUnits';
import {
    EVENT_COLOR,
    EVENT_RADIUS,
    EVENT_BUFFER,
} from '../../../constants/layers';
import styles from '../styles/LayerDialog.module.css';

import {
    setProgram,
    setProgramStage,
    setEventStatus,
    setEventCoordinateField,
    setEventClustering,
    setEventPointColor,
    setEventPointRadius,
    setOrgUnitRoot,
    setUserOrgUnits,
    toggleOrgUnit,
    setPeriod,
    setAreaRadius,
} from '../../../actions/layerEdit';

import {
    getPeriodFromFilters,
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics';
import { getStartEndDateError } from '../../../util/time';
import { cssColor } from '../../../util/colors';

export class EventDialog extends Component {
    static propTypes = {
        areaRadius: PropTypes.number,
        columns: PropTypes.array,
        defaultPeriod: PropTypes.string,
        endDate: PropTypes.string,
        eventClustering: PropTypes.bool,
        eventStatus: PropTypes.string,
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
        setEventStatus: PropTypes.func.isRequired,
        setEventCoordinateField: PropTypes.func.isRequired,
        setEventClustering: PropTypes.func.isRequired,
        setEventPointColor: PropTypes.func.isRequired,
        setEventPointRadius: PropTypes.func.isRequired,
        setOrgUnitRoot: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        setPeriod: PropTypes.func.isRequired,
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
        const {
            rows,
            filters,
            defaultPeriod,
            startDate,
            endDate,
            setOrgUnitRoot,
            setPeriod,
        } = this.props;

        const orgUnits = getOrgUnitNodesFromRows(rows);
        const period = getPeriodFromFilters(filters);

        // Set org unit tree root as default
        if (orgUnits.length === 0) {
            setOrgUnitRoot();
        }

        // Set default period from system settings
        if (!period && !startDate && !endDate && defaultPeriod) {
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
            eventStatus,
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
            setEventStatus,
            setEventCoordinateField,
            setEventClustering,
            setEventPointColor,
            setEventPointRadius,
            setUserOrgUnits,
            toggleOrgUnit,
            setPeriod,
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
                    <Tab value="data">{i18n.t('Data')}</Tab>
                    <Tab value="period">{i18n.t('Period')}</Tab>
                    <Tab value="orgunits">{i18n.t('Org Units')}</Tab>
                    <Tab value="filter">{i18n.t('Filter')}</Tab>
                    <Tab value="style">{i18n.t('Style')}</Tab>
                </Tabs>
                <div
                    className={styles.tabContent}
                    data-test="eventdialog-content"
                >
                    {tab === 'data' && (
                        <div
                            className={styles.flexRowFlow}
                            data-test="eventdialog-datatab"
                        >
                            <ProgramSelect
                                program={program}
                                onChange={setProgram}
                                className={styles.select}
                                errorText={programError}
                                data-test="eventdialog-programselect"
                            />
                            <ProgramStageSelect
                                program={program}
                                programStage={programStage}
                                onChange={setProgramStage}
                                className={styles.select}
                                errorText={programStageError}
                            />
                            <CoordinateField
                                program={program}
                                programStage={programStage}
                                value={eventCoordinateField}
                                onChange={setEventCoordinateField}
                                className={styles.select}
                            />
                            <EventStatusSelect
                                value={eventStatus}
                                onChange={setEventStatus}
                                className={styles.select}
                            />
                        </div>
                    )}
                    {tab === 'period' && (
                        <div
                            className={styles.flexRowFlow}
                            data-test="eventdialog-periodtab"
                        >
                            <RelativePeriodSelect
                                period={period}
                                startEndDates={true}
                                onChange={setPeriod}
                                className={styles.select}
                            />
                            {period && period.id === 'START_END_DATES' && (
                                <StartEndDates
                                    startDate={startDate}
                                    endDate={endDate}
                                    errorText={periodError}
                                />
                            )}
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <div
                            className={styles.flexColumnFlow}
                            data-test="eventdialog-orgunittab"
                        >
                            <div className={styles.orgUnitTree}>
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
                            <div className={styles.flexColumn}>
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
                            className={styles.flexRowFlow}
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
                            className={styles.flexColumnFlow}
                            data-test="eventdialog-styletab"
                        >
                            <div className={styles.flexColumn}>
                                <div className={styles.flexInnerColumnFlow}>
                                    <ImageSelect
                                        id="cluster"
                                        img="images/cluster.png"
                                        title={i18n.t('Group events')}
                                        onClick={() => setEventClustering(true)}
                                        isSelected={eventClustering}
                                        className={styles.flexInnerColumn}
                                    />
                                    <ImageSelect
                                        id="nocluster"
                                        img="images/nocluster.png"
                                        title={i18n.t('View all events')}
                                        onClick={() =>
                                            setEventClustering(false)
                                        }
                                        isSelected={!eventClustering}
                                        className={styles.flexInnerColumn}
                                    />
                                </div>
                                <div className={styles.flexInnerColumnFlow}>
                                    <ColorPicker
                                        label={i18n.t('Color')}
                                        color={
                                            cssColor(eventPointColor) ||
                                            EVENT_COLOR
                                        }
                                        onChange={setEventPointColor}
                                        className={styles.flexInnerColumn}
                                    />
                                    <NumberField
                                        label={i18n.t('Radius')}
                                        value={eventPointRadius || EVENT_RADIUS}
                                        onChange={setEventPointRadius}
                                        className={styles.flexInnerColumn}
                                    />
                                </div>
                                <div className={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Buffer')}
                                        checked={showBuffer}
                                        onChange={this.onShowBufferClick.bind(
                                            this
                                        )}
                                        className={styles.checkboxInline}
                                        disabled={eventClustering}
                                    />
                                    {showBuffer && (
                                        <NumberField
                                            label={i18n.t('Radius in meters')}
                                            value={areaRadius || ''}
                                            onChange={setAreaRadius}
                                            disabled={eventClustering}
                                            className={styles.flexInnerColumn}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.flexColumn}>
                                {program ? (
                                    <StyleByDataItem />
                                ) : (
                                    <div className={styles.notice}>
                                        <NoticeBox>
                                            {i18n.t(
                                                'You can style events by data element after selecting a program.'
                                            )}
                                        </NoticeBox>
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
        };

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
        setEventStatus,
        setEventCoordinateField,
        setEventClustering,
        setEventPointColor,
        setEventPointRadius,
        setOrgUnitRoot,
        setUserOrgUnits,
        toggleOrgUnit,
        setPeriod,
        setAreaRadius,
    },
    null,
    {
        forwardRef: true,
    }
)(EventDialog);
