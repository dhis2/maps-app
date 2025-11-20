import i18n from '@dhis2/d2-i18n'
import { NoticeBox, IconErrorFilled24 } from '@dhis2/ui'
import cx from 'classnames'
import React, { useState, useEffect, useCallback, Fragment } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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

const TrackedEntityDialog = () => {
    const dispatch = useDispatch()

    // --------------------------
    // Redux state
    // --------------------------
    const {
        startDate,
        endDate,
        trackedEntityType,
        program,
        programStatus,
        followUp,
        relationshipType,
        periodType,
        rows,
        orgUnits,
        eventPointColor,
        eventPointRadius,
        relatedPointColor,
        relatedPointRadius,
        relationshipLineColor,
        periodsSettings,
        validateLayer,
        onLayerValidation,
    } = useSelector((state) => ({
        startDate: state.layerEdit.startDate,
        endDate: state.layerEdit.endDate,
        trackedEntityType: state.layerEdit.trackedEntityType,
        program: state.layerEdit.program,
        programStatus: state.layerEdit.programStatus,
        followUp: state.layerEdit.followUp,
        relationshipType: state.layerEdit.relationshipType,
        periodType: state.layerEdit.periodType,
        rows: state.layerEdit.rows,
        orgUnits: state.layerEdit.orgUnits,
        eventPointColor: state.layerEdit.eventPointColor,
        eventPointRadius: state.layerEdit.eventPointRadius,
        relatedPointColor: state.layerEdit.relatedPointColor,
        relatedPointRadius: state.layerEdit.relatedPointRadius,
        relationshipLineColor: state.layerEdit.relationshipLineColor,
        periodsSettings: state.layerEdit.periodsSettings,
        validateLayer: state.layerEdit.validateLayer,
        onLayerValidation: state.layerEdit.onLayerValidation,
    }))

    // --------------------------
    // Local state
    // --------------------------
    const [tab, setTab] = useState('data')
    const [showRelationshipsChecked, setShowRelationshipsChecked] =
        useState(false)
    const [trackedEntityTypeError, setTrackedEntityTypeError] = useState(null)
    const [orgUnitsError, setOrgUnitsError] = useState(null)
    const [periodError, setPeriodError] = useState(null)

    // --------------------------
    // Lifecycle: componentDidMount
    // --------------------------
    useEffect(() => {
        const hasDate = startDate !== undefined && endDate !== undefined

        // Set default period if missing
        if (!hasDate) {
            const defaultDates = getDefaultDatesInCalendar()
            dispatch(setStartDate(defaultDates.startDate))
            dispatch(setEndDate(defaultDates.endDate))
        }

        if (relationshipType) {
            setShowRelationshipsChecked(true)
        }

        // Set default org units if missing
        if (!rows && orgUnits?.roots) {
            dispatch(setOrgUnits({ dimension: 'ou', items: orgUnits.roots }))
        }
    }, [dispatch, endDate, orgUnits.roots, relationshipType, rows, startDate])

    // --------------------------
    // Lifecycle: componentDidUpdate
    // --------------------------
    useEffect(() => {
        if (validateLayer) {
            onLayerValidation(validate())
        }
    }, [validateLayer, validate, onLayerValidation])

    useEffect(() => {
        if (periodError && startDate && endDate) {
            setPeriodError(null)
        }
    }, [periodError, startDate, endDate])

    useEffect(() => {
        if (!program) {
            dispatch(setPeriodType(LAST_UPDATED_DATES))
        }
    }, [program, dispatch])

    // --------------------------
    // Validation
    // --------------------------
    const setErrorState = useCallback((key, message, tabName) => {
        switch (key) {
            case 'trackedEntityTypeError':
                setTrackedEntityTypeError(message)
                break
            case 'orgUnitsError':
                setOrgUnitsError(message)
                break
            case 'periodError':
                setPeriodError(message)
                break
        }
        setTab(tabName)
        return false
    }, [])

    const validate = useCallback(() => {
        if (!trackedEntityType) {
            return setErrorState(
                'trackedEntityTypeError',
                i18n.t('Tracked Entity Type is required'),
                'data'
            )
        }

        const error = getStartEndDateError(startDate, endDate)
        if (error) {
            return setErrorState('periodError', error, 'period')
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected.'),
                'orgunits'
            )
        }

        return true
    }, [trackedEntityType, startDate, endDate, rows, setErrorState])

    // --------------------------
    // Render
    // --------------------------
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
                                allPrograms
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
                    (!trackedEntityType ? (
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
                    ) : (
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
                                style={{ marginBottom: 0 }}
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
                        hideUserOrgUnits
                        hideAssociatedGeometry
                        hideSelectMode={false}
                        hideLevelSelect
                        hideGroupSelect
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
                                <Fragment>
                                    <div className={styles.header}>
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
                                </Fragment>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrackedEntityDialog
