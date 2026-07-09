import i18n from '@dhis2/d2-i18n'
import { NoticeBox, IconErrorFilled24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
import {
    setProgram,
    setProgramStage,
    setEventStatus,
    setEventCoordinateField,
    setEventClustering,
    setEventPointColor,
    setEventPointRadius,
    // setFallbackCoordinateField,
    setPeriod,
    setStartDate,
    setEndDate,
    setBackupPeriodsDates,
    setOrgUnits,
    setCountFeaturesWithoutCoordinates,
    setCountEventsOutsideOrgUnits,
} from '../../../actions/layerEdit.js'
import {
    EVENT_COLOR,
    EVENT_RADIUS,
    EVENT_BUFFER,
    CLASSIFICATION_PREDEFINED,
    MIN_RADIUS,
    MAX_RADIUS,
} from '../../../constants/layers.js'
import { START_END_DATES } from '../../../constants/periods.js'
import usePrevious from '../../../hooks/usePrevious.js'
import {
    getPeriodFromFilters,
    getOrgUnitsFromRows,
    splitFilterColumns,
} from '../../../util/analytics.js'
import { cssColor } from '../../../util/colors.js'
import { getDefaultDatesInCalendar } from '../../../util/date.js'
import { isPeriodAvailable } from '../../../util/periods.js'
import { getStartEndDateError } from '../../../util/time.js'
import { isValidIsolatedClass } from '../../classification/IsolatedClass.jsx'
import {
    Tab,
    Tabs,
    NumberField,
    ImageSelect,
    ColorPicker,
    Checkbox,
} from '../../core/index.js'
import CoordinateField from '../../dataItem/CoordinateField.jsx'
import EventDataItemsProvider from '../../dataItem/EventDataItemsProvider.jsx'
import FilterGroup from '../../dataItem/filter/FilterGroup.jsx'
import StyleByDataItem from '../../dataItem/StyleByDataItem.jsx'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.jsx'
import RelativePeriodSelect from '../../periods/RelativePeriodSelect.jsx'
import StartEndDate from '../../periods/StartEndDate.jsx'
import ProgramSelect from '../../program/ProgramSelect.jsx'
import ProgramStageSelect from '../../program/ProgramStageSelect.jsx'
import BufferRadius from '../shared/BufferRadius.jsx'
import GeometryCentroid from '../shared/GeometryCentroid.jsx'
import styles from '../styles/LayerDialog.module.css'
import EventStatusSelect from './EventStatusSelect.jsx'
import LabelFieldSelect from './LabelFieldSelect.jsx'

const DEFAULT_NO_COLUMNS = []
const DEFAULT_NO_FILTERS = []

const EventDialog = ({
    backupPeriodsDates,
    columns = DEFAULT_NO_COLUMNS,
    countEventsOutsideOrgUnits,
    countFeaturesWithoutCoordinates,
    endDate,
    eventClustering,
    eventCoordinateField,
    eventCoordinateFieldType,
    eventPointColor,
    eventPointRadius,
    eventStatus,
    filters = DEFAULT_NO_FILTERS,
    legendIsolated,
    legendSet,
    method,
    orgUnits,
    periodsSettings,
    program,
    programStage,
    rows,
    startDate,
    styleDataItem,
    systemSettings,
    validateLayer,
    onLayerValidation,
}) => {
    const dispatch = useDispatch()
    const [tab, setTab] = useState('data')
    const [programError, setProgramError] = useState()
    const [programStageError, setProgramStageError] = useState()
    const [periodError, setPeriodError] = useState()
    const [orgUnitsError, setOrgUnitsError] = useState()
    const [legendSetError, setLegendSetError] = useState()
    const [, setIsolatedClassError] = useState()
    const [, setStyleDataItemError] = useState()

    const prevStartDate = usePrevious(startDate)
    const prevEndDate = usePrevious(endDate)
    const prevFilters = usePrevious(filters)
    const currentPeriod = getPeriodFromFilters(filters)

    // Seeded with the current period so this is a no-op on mount
    const prevPeriodRef = useRef(currentPeriod)

    // Set default period from system settings
    useEffect(() => {
        const { keyAnalysisRelativePeriod: defaultPeriod, hiddenPeriods } =
            systemSettings
        const hasDate = startDate !== undefined && endDate !== undefined

        if (
            !currentPeriod &&
            !hasDate &&
            !backupPeriodsDates &&
            defaultPeriod &&
            isPeriodAvailable(defaultPeriod, hiddenPeriods)
        ) {
            dispatch(setPeriod({ id: defaultPeriod }))
        }
    }, [
        currentPeriod,
        systemSettings,
        startDate,
        endDate,
        backupPeriodsDates,
        dispatch,
    ])

    // Set default start/end dates
    useEffect(() => {
        const hasDate = startDate !== undefined && endDate !== undefined

        if (!hasDate && !backupPeriodsDates) {
            const defaultDates = getDefaultDatesInCalendar()
            dispatch(setStartDate(defaultDates.startDate))
            dispatch(setEndDate(defaultDates.endDate))
        }
    }, [startDate, endDate, backupPeriodsDates, dispatch])

    // Set org unit tree roots as default
    useEffect(() => {
        if (!rows && orgUnits?.roots) {
            dispatch(
                setOrgUnits({
                    dimension: 'ou',
                    items: orgUnits.roots,
                })
            )
        }
    }, [rows, orgUnits, dispatch])

    useEffect(() => {
        const prevPeriod = prevPeriodRef.current

        if (prevPeriod === undefined && currentPeriod !== undefined) {
            dispatch(setBackupPeriodsDates({ startDate, endDate }))
            dispatch(setStartDate())
            dispatch(setEndDate())
        } else if (prevPeriod !== undefined && currentPeriod === undefined) {
            dispatch(setStartDate(backupPeriodsDates?.startDate))
            dispatch(setEndDate(backupPeriodsDates?.endDate))
        }

        prevPeriodRef.current = currentPeriod
    }, [currentPeriod, startDate, endDate, backupPeriodsDates, dispatch])

    // Clear period error when dates or period change
    useEffect(() => {
        const prevPeriod = getPeriodFromFilters(prevFilters)

        if (
            periodError &&
            (startDate !== prevStartDate ||
                endDate !== prevEndDate ||
                currentPeriod !== prevPeriod)
        ) {
            setPeriodError(undefined)
        }
    }, [
        periodError,
        startDate,
        prevStartDate,
        endDate,
        prevEndDate,
        currentPeriod,
        prevFilters,
    ])

    // Layer validation function
    const validate = useCallback(() => {
        const period = getPeriodFromFilters(filters) || {
            id: START_END_DATES,
        }

        if (!program) {
            setProgramError(i18n.t('Program is required'))
            setTab('data')
            return false
        }

        if (!programStage) {
            setProgramStageError(i18n.t('Program stage is required'))
            setTab('data')
            return false
        }

        if (period.id === START_END_DATES) {
            const error = getStartEndDateError(startDate, endDate)
            if (error) {
                setPeriodError(error)
                setTab('period')
                return false
            }
        }

        if (!getOrgUnitsFromRows(rows).length) {
            setOrgUnitsError(i18n.t('No organisation units are selected.'))
            setTab('orgunits')
            return false
        }

        if (method === CLASSIFICATION_PREDEFINED && !legendSet) {
            setLegendSetError(i18n.t('No legend set is selected'))
            setTab('style')
            return false
        }

        if (!isValidIsolatedClass(legendIsolated)) {
            setIsolatedClassError(
                i18n.t('Isolated class max should be greater than min')
            )
            setTab('style')
            return false
        }

        if (
            styleDataItem &&
            styleDataItem.optionSet &&
            !styleDataItem.optionSet.options
        ) {
            // Occurs when there are too many options
            setStyleDataItemError('')
            setTab('style')
            return false
        }

        return true
    }, [
        program,
        programStage,
        filters,
        startDate,
        endDate,
        rows,
        method,
        legendSet,
        legendIsolated,
        styleDataItem,
    ])

    // Run layer validation
    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(validate())
        }
    }, [validateLayer, onLayerValidation, validate])

    const period = currentPeriod || { id: START_END_DATES }

    return (
        <EventDataItemsProvider
            programId={program?.id}
            programStageId={programStage?.id}
        >
            <div className={styles.content} data-test="eventdialog">
                <Tabs value={tab} onChange={setTab}>
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
                                onChange={(val) => dispatch(setProgram(val))}
                                className={styles.select}
                                errorText={programError}
                                data-test="eventdialog-programselect"
                            />
                            {program && (
                                <ProgramStageSelect
                                    program={program}
                                    programStage={programStage}
                                    onChange={(val) =>
                                        dispatch(setProgramStage(val))
                                    }
                                    className={styles.select}
                                    errorText={programStageError}
                                />
                            )}
                            <CoordinateField
                                program={program}
                                programStage={programStage}
                                value={eventCoordinateField}
                                type={eventCoordinateFieldType}
                                onChange={(fieldId, fieldType) =>
                                    dispatch(
                                        setEventCoordinateField(
                                            fieldId,
                                            fieldType
                                        )
                                    )
                                }
                                className={styles.select}
                                data-test="eventdialog-coordinatefield"
                            />
                            <GeometryCentroid tab={'data'} />
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
                                onChange={(val) =>
                                    dispatch(setEventStatus(val))
                                }
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
                                onChange={(val) => dispatch(setPeriod(val))}
                                className={styles.select}
                            />
                            {period && period.id === START_END_DATES && (
                                <StartEndDate
                                    onSelectStartDate={(val) =>
                                        dispatch(setStartDate(val))
                                    }
                                    onSelectEndDate={(val) =>
                                        dispatch(setEndDate(val))
                                    }
                                    periodsSettings={periodsSettings}
                                />
                            )}
                            {periodError && (
                                <div className={styles.error}>
                                    <IconErrorFilled24 />
                                    {periodError}
                                </div>
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
                            {programStage ? (
                                <FilterGroup
                                    filters={splitFilterColumns(
                                        columns.filter(
                                            (c) => c.filter !== undefined
                                        )
                                    )}
                                />
                            ) : (
                                <div className={styles.notice}>
                                    <NoticeBox>
                                        {i18n.t(
                                            'Filtering is available after selecting a program stage.'
                                        )}
                                    </NoticeBox>
                                </div>
                            )}
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
                                        onClick={() =>
                                            dispatch(setEventClustering(true))
                                        }
                                        isSelected={eventClustering}
                                        className={styles.flexInnerColumn}
                                    />
                                    <ImageSelect
                                        id="nocluster"
                                        img="images/nocluster.png"
                                        title={i18n.t('View all events')}
                                        onClick={() =>
                                            dispatch(setEventClustering(false))
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
                                        onChange={(val) =>
                                            dispatch(setEventPointColor(val))
                                        }
                                        className={styles.flexInnerColumn}
                                    />
                                    <NumberField
                                        label={i18n.t('Radius')}
                                        min={MIN_RADIUS}
                                        max={MAX_RADIUS}
                                        value={eventPointRadius || EVENT_RADIUS}
                                        onChange={(val) =>
                                            dispatch(setEventPointRadius(val))
                                        }
                                    />
                                </div>
                                <GeometryCentroid tab={'style'} />
                                <BufferRadius
                                    disabled={eventClustering}
                                    defaultRadius={EVENT_BUFFER}
                                />
                                <LabelFieldSelect />
                                <Checkbox
                                    label={i18n.t(
                                        'Count events without coordinates'
                                    )}
                                    checked={!!countFeaturesWithoutCoordinates}
                                    onChange={(checked) =>
                                        dispatch(
                                            setCountFeaturesWithoutCoordinates(
                                                checked
                                            )
                                        )
                                    }
                                />
                                <Checkbox
                                    label={i18n.t(
                                        'Filter and count events outside org unit boundaries'
                                    )}
                                    checked={!!countEventsOutsideOrgUnits}
                                    onChange={(checked) =>
                                        dispatch(
                                            setCountEventsOutsideOrgUnits(
                                                checked
                                            )
                                        )
                                    }
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                {program ? (
                                    <StyleByDataItem
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
        </EventDataItemsProvider>
    )
}

EventDialog.propTypes = {
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    backupPeriodsDates: PropTypes.object,
    columns: PropTypes.array,
    countEventsOutsideOrgUnits: PropTypes.bool,
    countFeaturesWithoutCoordinates: PropTypes.bool,
    endDate: PropTypes.string,
    eventClustering: PropTypes.bool,
    eventCoordinateField: PropTypes.string,
    eventCoordinateFieldType: PropTypes.string,
    eventPointColor: PropTypes.string,
    eventPointRadius: PropTypes.number,
    eventStatus: PropTypes.string,
    // fallbackCoordinateField: PropTypes.string,
    filters: PropTypes.array,
    legendIsolated: PropTypes.object,
    legendSet: PropTypes.object,
    method: PropTypes.number,
    orgUnits: PropTypes.object,
    periodsSettings: PropTypes.object,
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
        trackedEntityType: PropTypes.object,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    rows: PropTypes.array,
    startDate: PropTypes.string,
    styleDataItem: PropTypes.shape({
        id: PropTypes.string.isRequired,
        optionSet: PropTypes.shape({
            options: PropTypes.array,
        }),
    }),
    systemSettings: PropTypes.object,
}

export default EventDialog
