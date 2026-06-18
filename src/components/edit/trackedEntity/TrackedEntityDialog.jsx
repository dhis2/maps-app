import i18n from '@dhis2/d2-i18n'
import { NoticeBox, IconErrorFilled24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
    setTrackedEntityType,
    setProgram,
    setProgramStatus,
    setFollowUpStatus,
    setTrackedEntityRelationshipType,
    setPeriodType,
    setStartDate,
    setEndDate,
    setOrgUnits,
    setEventPointColor,
    setEventPointRadius,
    setRelatedPointColor,
    setRelatedPointRadius,
    setRelationshipLineColor,
} from '../../../actions/layerEdit.js'
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_BUFFER,
    TEI_RELATED_COLOR,
    TEI_RELATIONSHIP_LINE_COLOR,
    TEI_RELATED_RADIUS,
    MIN_RADIUS,
    MAX_RADIUS,
} from '../../../constants/layers.js'
import { LAST_UPDATED_DATES } from '../../../constants/periods.js'
import usePrevious from '../../../hooks/usePrevious.js'
import { getOrgUnitsFromRows } from '../../../util/analytics.js'
import { getDefaultDatesInCalendar } from '../../../util/date.js'
import { getStartEndDateError } from '../../../util/time.js'
import {
    Tab,
    Tabs,
    NumberField,
    Checkbox,
    ColorPicker,
} from '../../core/index.js'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.jsx'
import StartEndDate from '../../periods/StartEndDate.jsx'
import ProgramSelect from '../../program/ProgramSelect.jsx'
import TrackedEntityTypeSelect from '../../trackedEntity/TrackedEntityTypeSelect.jsx'
import BufferRadius from '../shared/BufferRadius.jsx'
import styles from '../styles/LayerDialog.module.css'
import PeriodTypeSelect from './PeriodTypeSelect.jsx'
import ProgramStatusSelect from './ProgramStatusSelect.jsx'
import TrackedEntityRelationshipTypeSelect from './TrackedEntityRelationshipTypeSelect.jsx'

const TrackedEntityDialog = ({
    eventPointColor,
    eventPointRadius,
    followUp,
    periodType,
    program,
    programStatus,
    trackedEntityType,
    relationshipType,
    relatedPointColor,
    relatedPointRadius,
    relationshipLineColor,
    periodsSettings,
    rows,
    startDate,
    endDate,
    orgUnits,
    validateLayer,
    onLayerValidation,
}) => {
    const dispatch = useDispatch()
    const [tab, setTab] = useState('data')
    const [showRelationshipsChecked, setShowRelationshipsChecked] =
        useState(false)
    const [trackedEntityTypeError, setTrackedEntityTypeError] = useState()
    const [orgUnitsError, setOrgUnitsError] = useState()
    const [periodError, setPeriodError] = useState()

    const prevProgram = usePrevious(program)
    const prevStartDate = usePrevious(startDate)
    const prevEndDate = usePrevious(endDate)

    // Set default date range for new layers
    useEffect(() => {
        if (startDate === undefined && endDate === undefined) {
            const defaultDates = getDefaultDatesInCalendar()
            dispatch(setStartDate(defaultDates.startDate))
            dispatch(setEndDate(defaultDates.endDate))
        }
    }, [startDate, endDate, dispatch])

    // Initialize relationships checkbox from existing config
    useEffect(() => {
        if (relationshipType) {
            setShowRelationshipsChecked(true)
        }
    }, [relationshipType])

    // Set org unit tree roots as default for new layers
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

    // Layer validation function
    const validate = useCallback(() => {
        if (!trackedEntityType) {
            setTrackedEntityTypeError(i18n.t('Tracked Entity Type is required'))
            setTab('data')
            return false
        }

        const error = getStartEndDateError(startDate, endDate)
        if (error) {
            setPeriodError(error)
            setTab('period')
            return false
        }

        if (!getOrgUnitsFromRows(rows).length) {
            setOrgUnitsError(i18n.t('No organisation units are selected.'))
            setTab('orgunits')
            return false
        }

        return true
    }, [trackedEntityType, startDate, endDate, rows])

    // Run layer validation
    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(validate())
        }
    }, [validateLayer, onLayerValidation, validate])

    // Clear period error when dates change
    useEffect(() => {
        if (
            periodError &&
            (startDate !== prevStartDate || endDate !== prevEndDate)
        ) {
            setPeriodError(undefined)
        }
    }, [periodError, startDate, prevStartDate, endDate, prevEndDate])

    // Reset period type when program is cleared
    useEffect(() => {
        if (prevProgram && !program) {
            dispatch(setPeriodType(LAST_UPDATED_DATES))
        }
    }, [prevProgram, program, dispatch])

    return (
        <div className={styles.content}>
            <Tabs value={tab} onChange={setTab}>
                <Tab value="data">{i18n.t('Data')}</Tab>
                <Tab value="relationships">{i18n.t('Relationships')}</Tab>
                <Tab value="period">{i18n.t('Period')}</Tab>
                <Tab value="orgunits">{i18n.t('Org Units')}</Tab>
                <Tab value="style">{i18n.t('Style')}</Tab>
            </Tabs>
            <div className={styles.tabContent}>
                {tab === 'data' && (
                    <div className={styles.flexRowFlow}>
                        <TrackedEntityTypeSelect
                            trackedEntityType={trackedEntityType}
                            onChange={(val) =>
                                dispatch(setTrackedEntityType(val))
                            }
                            className={styles.select}
                            errorText={trackedEntityTypeError}
                        />
                        {trackedEntityType && (
                            <ProgramSelect
                                allPrograms={true}
                                program={program}
                                trackedEntityType={trackedEntityType}
                                onChange={(val) => dispatch(setProgram(val))}
                                className={styles.select}
                            />
                        )}
                        {program && (
                            <ProgramStatusSelect
                                value={programStatus}
                                onChange={(val) =>
                                    dispatch(setProgramStatus(val))
                                }
                                className={styles.select}
                            />
                        )}
                        {program && (
                            <Checkbox
                                label={i18n.t('Follow up')}
                                checked={followUp}
                                onChange={(val) =>
                                    dispatch(setFollowUpStatus(val))
                                }
                            />
                        )}
                    </div>
                )}
                {tab === 'relationships' &&
                    (trackedEntityType ? (
                        <div className={styles.flexRowFlow}>
                            <div className={styles.notice}>
                                <NoticeBox warning title="Warning">
                                    {i18n.t(
                                        'Displaying tracked entity relationships in Maps is an experimental feature'
                                    )}
                                </NoticeBox>
                            </div>
                            <Checkbox
                                label={i18n.t(
                                    'Display Tracked Entity relationships'
                                )}
                                checked={showRelationshipsChecked}
                                onChange={(checked) => {
                                    if (!checked) {
                                        dispatch(
                                            setTrackedEntityRelationshipType(
                                                null
                                            )
                                        )
                                    }
                                    setShowRelationshipsChecked(checked)
                                }}
                                style={{
                                    marginBottom: 12,
                                }}
                            />
                            {showRelationshipsChecked && (
                                <TrackedEntityRelationshipTypeSelect
                                    trackedEntityType={trackedEntityType}
                                    value={relationshipType}
                                    onChange={(val) =>
                                        dispatch(
                                            setTrackedEntityRelationshipType(
                                                val
                                            )
                                        )
                                    }
                                    className={cx(styles.select, styles.indent)}
                                />
                            )}
                        </div>
                    ) : (
                        <div
                            style={{
                                fontSize: 14,
                                paddingTop: 16,
                                marginLeft: 16,
                            }}
                        >
                            {i18n.t(
                                'Please select a Tracked Entity Type before selecting a Relationship Type'
                            )}
                        </div>
                    ))}
                {tab === 'period' && (
                    <div className={styles.flexRowFlow}>
                        <PeriodTypeSelect
                            program={program}
                            periodType={periodType}
                            onChange={(val) => dispatch(setPeriodType(val))}
                        />
                        <StartEndDate
                            onSelectStartDate={(val) =>
                                dispatch(setStartDate(val))
                            }
                            onSelectEndDate={(val) => dispatch(setEndDate(val))}
                            periodsSettings={periodsSettings}
                        />
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
                        hideUserOrgUnits={true}
                        hideAssociatedGeometry={true}
                        hideSelectMode={false}
                        hideLevelSelect={true}
                        hideGroupSelect={true}
                        warning={orgUnitsError}
                    />
                )}
                {tab === 'style' && (
                    <div className={styles.flexColumnFlow}>
                        <div className={styles.flexColumn}>
                            <div className={styles.header}>
                                {i18n.t('Tracked entity style')}:
                            </div>
                            <div className={styles.flexInnerColumnFlow}>
                                <ColorPicker
                                    label={i18n.t('Color')}
                                    color={eventPointColor || TEI_COLOR}
                                    onChange={(val) =>
                                        dispatch(setEventPointColor(val))
                                    }
                                    className={styles.flexInnerColumn}
                                />
                                <NumberField
                                    label={i18n.t('Point size')}
                                    value={eventPointRadius || TEI_RADIUS}
                                    onChange={(val) =>
                                        dispatch(setEventPointRadius(val))
                                    }
                                    className={styles.flexInnerColumn}
                                />
                            </div>
                            <BufferRadius defaultRadius={TEI_BUFFER} />
                            {relationshipType && (
                                <>
                                    <div
                                        className={cx(
                                            styles.header,
                                            styles.sectionHeader
                                        )}
                                    >
                                        {i18n.t('Related entity style')}:
                                    </div>
                                    <div className={styles.flexInnerColumnFlow}>
                                        <ColorPicker
                                            label={i18n.t('Color')}
                                            color={
                                                relatedPointColor ||
                                                TEI_RELATED_COLOR
                                            }
                                            onChange={(val) =>
                                                dispatch(
                                                    setRelatedPointColor(val)
                                                )
                                            }
                                            className={styles.flexInnerColumn}
                                        />
                                        <NumberField
                                            label={i18n.t('Point size')}
                                            min={MIN_RADIUS}
                                            max={MAX_RADIUS}
                                            value={
                                                relatedPointRadius ||
                                                TEI_RELATED_RADIUS
                                            }
                                            onChange={(val) =>
                                                dispatch(
                                                    setRelatedPointRadius(val)
                                                )
                                            }
                                            className={styles.flexInnerColumn}
                                        />
                                        <ColorPicker
                                            label={i18n.t('Line Color')}
                                            color={
                                                relationshipLineColor ||
                                                TEI_RELATIONSHIP_LINE_COLOR
                                            }
                                            onChange={(val) =>
                                                dispatch(
                                                    setRelationshipLineColor(
                                                        val
                                                    )
                                                )
                                            }
                                            className={styles.flexInnerColumn}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className={styles.flexColumn} />
                    </div>
                )}
            </div>
        </div>
    )
}

TrackedEntityDialog.propTypes = {
    validateLayer: PropTypes.bool.isRequired,
    onLayerValidation: PropTypes.func.isRequired,
    endDate: PropTypes.string,
    eventPointColor: PropTypes.string,
    eventPointRadius: PropTypes.number,
    followUp: PropTypes.bool,
    orgUnits: PropTypes.object,
    periodType: PropTypes.string,
    periodsSettings: PropTypes.object,
    program: PropTypes.object,
    programStatus: PropTypes.string,
    relatedPointColor: PropTypes.string,
    relatedPointRadius: PropTypes.number,
    relationshipLineColor: PropTypes.string,
    relationshipType: PropTypes.string,
    rows: PropTypes.array,
    startDate: PropTypes.string,
    trackedEntityType: PropTypes.object,
}

export default TrackedEntityDialog
