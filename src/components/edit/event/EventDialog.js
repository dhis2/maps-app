import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    setProgram,
    setProgramStage,
    setEventStatus,
    setEventCoordinateField,
    setEventClustering,
    setEventPointColor,
    setEventPointRadius,
    setFallbackCoordinateField,
    setPeriod,
    setStartDate,
    setEndDate,
    setOrgUnits,
} from '../../../actions/layerEdit.js'
import {
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
    EVENT_COLOR,
    EVENT_RADIUS,
    EVENT_BUFFER,
    CLASSIFICATION_PREDEFINED,
    MIN_RADIUS,
    MAX_RADIUS,
} from '../../../constants/layers.js'
import { START_END_DATES } from '../../../constants/periods.js'
import {
    getPeriodFromFilters,
    getOrgUnitsFromRows,
} from '../../../util/analytics.js'
import { cssColor } from '../../../util/colors.js'
import { isPeriodAvailable } from '../../../util/periods.js'
import { getStartEndDateError } from '../../../util/time.js'
import {
    Tab,
    Tabs,
    NumberField,
    ImageSelect,
    ColorPicker,
} from '../../core/index.js'
import CoordinateField from '../../dataItem/CoordinateField.js'
import FilterGroup from '../../dataItem/filter/FilterGroup.js'
import StyleByDataItem from '../../dataItem/StyleByDataItem.js'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.js'
import RelativePeriodSelect from '../../periods/RelativePeriodSelect.js'
import StartEndDates from '../../periods/StartEndDates.js'
import ProgramSelect from '../../program/ProgramSelect.js'
import ProgramStageSelect from '../../program/ProgramStageSelect.js'
import { SystemSettingsCtx } from '../../SystemSettingsProvider.js'
import BufferRadius from '../shared/BufferRadius.js'
import styles from '../styles/LayerDialog.module.css'
import EventStatusSelect from './EventStatusSelect.js'

class EventDialog extends Component {
    static propTypes = {
        setEndDate: PropTypes.func.isRequired,
        setEventClustering: PropTypes.func.isRequired,
        setEventCoordinateField: PropTypes.func.isRequired,
        setEventPointColor: PropTypes.func.isRequired,
        setEventPointRadius: PropTypes.func.isRequired,
        setEventStatus: PropTypes.func.isRequired,
        setFallbackCoordinateField: PropTypes.func.isRequired,
        setOrgUnits: PropTypes.func.isRequired,
        setPeriod: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setProgramStage: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        columns: PropTypes.array,
        defaultPeriod: PropTypes.string,
        endDate: PropTypes.string,
        eventClustering: PropTypes.bool,
        eventCoordinateField: PropTypes.string,
        eventPointColor: PropTypes.string,
        eventPointRadius: PropTypes.number,
        eventStatus: PropTypes.string,
        fallbackCoordinateField: PropTypes.string,
        filters: PropTypes.array,
        legendSet: PropTypes.object,
        method: PropTypes.number,
        orgUnits: PropTypes.object,
        program: PropTypes.shape({
            id: PropTypes.string.isRequired,
            trackedEntityType: PropTypes.object,
        }),
        programStage: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
        rows: PropTypes.array,
        settings: PropTypes.object,
        startDate: PropTypes.string,
        styleDataItem: PropTypes.shape({
            id: PropTypes.string.isRequired,
            optionSet: PropTypes.shape({
                options: PropTypes.array,
            }),
        }),
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            tab: 'data',
        }
    }

    componentDidMount() {
        const {
            rows,
            filters,
            defaultPeriod,
            settings,
            startDate,
            endDate,
            orgUnits,
            setPeriod,
            setStartDate,
            setEndDate,
            setOrgUnits,
        } = this.props

        const period = getPeriodFromFilters(filters)

        // Set default period from system settings
        if (
            !period &&
            !startDate &&
            !endDate &&
            defaultPeriod &&
            isPeriodAvailable(defaultPeriod, settings.hiddenPeriods)
        ) {
            setPeriod({
                id: defaultPeriod,
            })
        } else if (!startDate && !endDate) {
            setStartDate(DEFAULT_START_DATE)
            setEndDate(DEFAULT_END_DATE)
        }

        // Set org unit tree roots as default
        if (!rows && orgUnits.roots) {
            setOrgUnits({
                dimension: 'ou',
                items: orgUnits.roots,
            })
        }
    }

    componentDidUpdate(prev) {
        const { validateLayer, onLayerValidation } = this.props

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate())
        }
    }

    render() {
        const {
            // layer options
            columns = [],
            endDate,
            eventClustering,
            eventStatus,
            eventCoordinateField,
            eventPointColor,
            eventPointRadius,
            // fallbackCoordinateField,
            filters = [],
            program,
            programStage,
            startDate,
            legendSet,
        } = this.props

        const {
            // handlers
            setProgram,
            setProgramStage,
            setEventStatus,
            setEventCoordinateField,
            setEventClustering,
            setEventPointColor,
            setEventPointRadius,
            // setFallbackCoordinateField,
            setPeriod,
        } = this.props

        const {
            tab,
            programError,
            programStageError,
            periodError,
            orgUnitsError,
            legendSetError,
        } = this.state

        const period = getPeriodFromFilters(filters) || {
            id: START_END_DATES,
        }

        return (
            <div className={styles.content} data-test="eventdialog">
                <Tabs value={tab} onChange={(tab) => this.setState({ tab })}>
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
                            {program && (
                                <ProgramStageSelect
                                    program={program}
                                    programStage={programStage}
                                    onChange={setProgramStage}
                                    className={styles.select}
                                    errorText={programStageError}
                                />
                            )}
                            <CoordinateField
                                program={program}
                                programStage={programStage}
                                value={eventCoordinateField}
                                onChange={setEventCoordinateField}
                                className={styles.select}
                            />
                            {/* eventCoordinateField && (
                                <CoordinateField
                                    program={program}
                                    programStage={programStage}
                                    value={fallbackCoordinateField}
                                    eventCoordinateField={eventCoordinateField}
                                    onChange={setFallbackCoordinateField}
                                    className={styles.select}
                                />
                            ) */}
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
                            {period && period.id === START_END_DATES && (
                                <StartEndDates
                                    startDate={startDate}
                                    endDate={endDate}
                                    errorText={periodError}
                                />
                            )}
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <OrgUnitSelect
                            hideAssociatedGeometry={true}
                            hideLevelSelect={true}
                            hideGroupSelect={true}
                            warning={orgUnitsError}
                        />
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
                                    (c) => c.filter !== undefined
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
                                        min={MIN_RADIUS}
                                        max={MAX_RADIUS}
                                        value={eventPointRadius || EVENT_RADIUS}
                                        onChange={setEventPointRadius}
                                    />
                                </div>
                                <BufferRadius
                                    disabled={eventClustering}
                                    defaultRadius={EVENT_BUFFER}
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                {program ? (
                                    <StyleByDataItem
                                        program={program}
                                        programStage={programStage}
                                        error={!legendSet && legendSetError}
                                    />
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
        )
    }

    // TODO: Add to parent class?
    setErrorState(key, message, tab) {
        this.setState({
            [key]: message,
            tab,
        })

        return false
    }

    validate() {
        const {
            program,
            programStage,
            rows,
            filters,
            startDate,
            endDate,
            method,
            legendSet,
            styleDataItem,
        } = this.props

        const period = getPeriodFromFilters(filters) || {
            id: START_END_DATES,
        }

        if (!program) {
            return this.setErrorState(
                'programError',
                i18n.t('Program is required'),
                'data'
            )
        }

        if (!programStage) {
            return this.setErrorState(
                'programStageError',
                i18n.t('Program stage is required'),
                'data'
            )
        }

        if (period.id === START_END_DATES) {
            const error = getStartEndDateError(startDate, endDate)
            if (error) {
                return this.setErrorState('periodError', error, 'period')
            }
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected.'),
                'orgunits'
            )
        }

        if (method === CLASSIFICATION_PREDEFINED && !legendSet) {
            return this.setErrorState(
                'legendSetError',
                i18n.t('No legend set is selected'),
                'style'
            )
        }

        if (
            styleDataItem &&
            styleDataItem.optionSet &&
            !styleDataItem.optionSet.options
        ) {
            // Occurs when there are too many options
            return this.setErrorState('styleDataItemError', '', 'style')
        }

        return true
    }
}

const EventDialogWithSettings = (props) => (
    <SystemSettingsCtx.Consumer>
        {(settings) => <EventDialog settings={settings} {...props} />}
    </SystemSettingsCtx.Consumer>
)

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
        setFallbackCoordinateField,
        setPeriod,
        setStartDate,
        setEndDate,
        setOrgUnits,
    },
    null,
    {
        forwardRef: true,
    }
)(EventDialogWithSettings)
