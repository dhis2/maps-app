import { PeriodDimension } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, IconErrorFilled24, SegmentedControl } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
    setPeriods,
    setPeriodType,
    setStartDate,
    setEndDate,
    setBackupPeriodsDates,
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
import {
    PREDEFINED_PERIODS,
    START_END_DATES,
} from '../../../constants/periods.js'
import usePrevious from '../../../hooks/usePrevious.js'
import {
    getPeriodsFromFilters,
    getOrgUnitsFromRows,
    splitFilterColumns,
} from '../../../util/analytics.js'
import { cssColor } from '../../../util/colors.js'
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
import StartEndDate from '../../periods/StartEndDate.jsx'
import ProgramSelect from '../../program/ProgramSelect.jsx'
import ProgramStageSelect from '../../program/ProgramStageSelect.jsx'
import BufferRadius from '../shared/BufferRadius.jsx'
import GeometryCentroid from '../shared/GeometryCentroid.jsx'
import { getPeriodValidationRules } from '../shared/validatePeriod.js'
import styles from '../styles/LayerDialog.module.css'
import EventStatusSelect from './EventStatusSelect.jsx'
import { initializeEventLayer } from './initializeEventLayer.js'
import LabelFieldSelect from './LabelFieldSelect.jsx'

const DEFAULT_NO_COLUMNS = []

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
    filters,
    legendIsolated,
    legendSet,
    method,
    orgUnits,
    periodType,
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

    const prevPeriodType = usePrevious(periodType)
    const prevStartDate = usePrevious(startDate)
    const prevEndDate = usePrevious(endDate)
    const prevFilters = usePrevious(filters)

    const periods = useMemo(() => getPeriodsFromFilters(filters), [filters])

    useEffect(() => {
        dispatch(
            initializeEventLayer({
                periodType,
                startDate,
                endDate,
                filters,
                systemSettings,
                rows,
                orgUnits,
            })
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Handle period type change
    useEffect(() => {
        if (prevPeriodType && periodType !== prevPeriodType) {
            switch (periodType) {
                case PREDEFINED_PERIODS:
                    dispatch(
                        setBackupPeriodsDates({
                            ...backupPeriodsDates,
                            type: START_END_DATES,
                            startDate,
                            endDate,
                        })
                    )
                    dispatch(setPeriods(backupPeriodsDates?.periods || []))
                    dispatch(setStartDate())
                    dispatch(setEndDate())
                    break
                case START_END_DATES:
                    dispatch(
                        setBackupPeriodsDates({
                            ...backupPeriodsDates,
                            type: PREDEFINED_PERIODS,
                            periods: getPeriodsFromFilters(filters),
                        })
                    )
                    dispatch(setStartDate(backupPeriodsDates?.startDate))
                    dispatch(setEndDate(backupPeriodsDates?.endDate))
                    dispatch(setPeriods([]))
                    break
            }
        } else if (
            periodError &&
            (periodType !== prevPeriodType ||
                startDate !== prevStartDate ||
                endDate !== prevEndDate ||
                getPeriodsFromFilters(filters).length !==
                    getPeriodsFromFilters(prevFilters).length)
        ) {
            setPeriodError(undefined)
        }
    }, [
        periodType,
        prevPeriodType,
        startDate,
        prevStartDate,
        endDate,
        prevEndDate,
        backupPeriodsDates,
        periodError,
        filters,
        prevFilters,
        dispatch,
    ])

    // Layer validation function
    const validate = useCallback(() => {
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

        const periodRule = getPeriodValidationRules({
            periodType,
            startDate,
            endDate,
            periods,
        }).find((rule) => rule.condition)
        if (periodRule) {
            setPeriodError(periodRule.msg)
            setTab('period')
            return false
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
        periodType,
        startDate,
        endDate,
        periods,
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
                            <div className={styles.background}>
                                <div
                                    className={cx(
                                        styles.navigation,
                                        styles.periodBox
                                    )}
                                >
                                    <SegmentedControl
                                        className={styles.flexRowFlow}
                                        options={[
                                            {
                                                label: i18n.t(
                                                    'Choose from presets'
                                                ),
                                                value: PREDEFINED_PERIODS,
                                            },
                                            {
                                                label: i18n.t(
                                                    'Define start - end dates'
                                                ),
                                                value: START_END_DATES,
                                            },
                                        ]}
                                        selected={periodType}
                                        onChange={({ value }) =>
                                            dispatch(
                                                setPeriodType({ value }, true)
                                            )
                                        }
                                    />
                                </div>
                                {periodType === PREDEFINED_PERIODS && (
                                    <PeriodDimension
                                        selectedPeriods={periods}
                                        onSelect={({ items }) =>
                                            dispatch(setPeriods(items))
                                        }
                                        excludedPeriodTypes={
                                            systemSettings.hiddenPeriods
                                        }
                                        height="324px"
                                    />
                                )}
                                {periodType === START_END_DATES && (
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
                                <div
                                    className={cx(
                                        styles.flexInnerColumnFlow,
                                        styles.pointStyle
                                    )}
                                >
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
    periodType: PropTypes.string,
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
