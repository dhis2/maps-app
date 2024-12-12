import i18n from '@dhis2/d2-i18n'
import { NoticeBox, IconErrorFilled24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
    setTrackedEntityType,
    setProgram,
    setProgramStatus,
    setFollowUpStatus,
    setTrackedEntityRelationshipType,
    setTrackedEntityRelationshipOutsideProgram,
    setStartDate,
    setEndDate,
    setOrgUnits,
    setEventPointColor,
    setEventPointRadius,
    setRelatedPointColor,
    setRelatedPointRadius,
    setRelationshipLineColor,
    setStyleDataItem,
} from '../../../actions/layerEdit.js'
import {
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
    TEI_COLOR,
    TEI_RADIUS,
    TEI_BUFFER,
    TEI_RELATED_COLOR,
    TEI_RELATIONSHIP_LINE_COLOR,
    TEI_RELATED_RADIUS,
    MIN_RADIUS,
    MAX_RADIUS,
} from '../../../constants/layers.js'
import { getOrgUnitsFromRows } from '../../../util/analytics.js'
import { getStartEndDateError } from '../../../util/time.js'
import {
    Tab,
    Tabs,
    NumberField,
    Checkbox,
    ColorPicker,
} from '../../core/index.js'
import OrgUnitSelect from '../../orgunits/OrgUnitSelect.js'
import StartEndDate from '../../periods/StartEndDate.js'
import ProgramSelect from '../../program/ProgramSelect.js'
import TrackedEntityTypeSelect from '../../trackedEntity/TrackedEntityTypeSelect.js'
import BufferRadius from '../shared/BufferRadius.js'
import styles from '../styles/LayerDialog.module.css'
import PeriodTypeSelect from './PeriodTypeSelect.js'
import ProgramStatusSelect from './ProgramStatusSelect.js'
import TrackedEntityRelationshipTypeSelect from './TrackedEntityRelationshipTypeSelect.js'

class TrackedEntityDialog extends Component {
    static propTypes = {
        setEndDate: PropTypes.func.isRequired,
        setEventPointColor: PropTypes.func.isRequired,
        setEventPointRadius: PropTypes.func.isRequired,
        setFollowUpStatus: PropTypes.func.isRequired,
        setOrgUnits: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setProgramStatus: PropTypes.func.isRequired,
        setRelatedPointColor: PropTypes.func.isRequired,
        setRelatedPointRadius: PropTypes.func.isRequired,
        setRelationshipLineColor: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        setTrackedEntityRelationshipType: PropTypes.func.isRequired,
        setTrackedEntityType: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        endDate: PropTypes.string,
        eventPointColor: PropTypes.string,
        eventPointRadius: PropTypes.number,
        followUp: PropTypes.bool,
        orgUnits: PropTypes.object,
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

    constructor(props, context) {
        super(props, context)
        this.state = {
            tab: 'data',
            showRelationshipsChecked: false,
        }
    }

    componentDidMount() {
        const {
            rows,
            startDate,
            endDate,
            relationshipType,
            orgUnits,
            setStartDate,
            setEndDate,
            setOrgUnits,
        } = this.props

        const hasDate = startDate !== undefined && endDate !== undefined

        // Set default period (last year)
        if (!hasDate) {
            setStartDate(DEFAULT_START_DATE)
            setEndDate(DEFAULT_END_DATE)
        }

        if (relationshipType) {
            this.setState({
                showRelationshipsChecked: true,
            })
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
        const { validateLayer, onLayerValidation, startDate, endDate } =
            this.props
        const { periodError } = this.state

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate())
        }

        if (
            periodError &&
            (startDate !== prev.startDate || endDate !== prev.endDate)
        ) {
            this.setErrorState('periodError', null, 'period')
        }
    }

    render() {
        const {
            endDate,
            eventPointColor,
            eventPointRadius,
            followUp,
            program,
            programStatus,
            startDate,
            trackedEntityType,
            relationshipType,
            relatedPointColor,
            relatedPointRadius,
            relationshipLineColor,
            periodsSettings,
        } = this.props

        const {
            setTrackedEntityType,
            setProgram,
            setProgramStatus,
            setFollowUpStatus,
            setTrackedEntityRelationshipType,
            setEventPointColor,
            setEventPointRadius,
            setRelatedPointColor,
            setRelatedPointRadius,
            setRelationshipLineColor,
        } = this.props

        const { tab, trackedEntityTypeError, orgUnitsError, periodError } =
            this.state

        return (
            <div className={styles.content}>
                <Tabs value={tab} onChange={(tab) => this.setState({ tab })}>
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
                                onChange={setTrackedEntityType}
                                className={styles.select}
                                errorText={trackedEntityTypeError}
                            />
                            {trackedEntityType && (
                                <ProgramSelect
                                    allPrograms={true}
                                    program={program}
                                    trackedEntityType={trackedEntityType}
                                    onChange={setProgram}
                                    className={styles.select}
                                />
                            )}
                            {program && (
                                <ProgramStatusSelect
                                    value={programStatus}
                                    onChange={setProgramStatus}
                                    className={styles.select}
                                />
                            )}
                            {program && (
                                <Checkbox
                                    label={i18n.t('Follow up')}
                                    checked={followUp}
                                    onChange={setFollowUpStatus}
                                />
                            )}
                        </div>
                    )}
                    {tab === 'relationships' &&
                        (!this.props.trackedEntityType ? (
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
                                    checked={
                                        this.state.showRelationshipsChecked
                                    }
                                    onChange={(checked) => {
                                        if (!checked) {
                                            setTrackedEntityRelationshipType(
                                                null
                                            )
                                        }
                                        this.setState({
                                            showRelationshipsChecked: checked,
                                        })
                                    }}
                                    style={{
                                        marginBottom: 0,
                                    }}
                                />
                                {this.state.showRelationshipsChecked && (
                                    <Fragment>
                                        <TrackedEntityRelationshipTypeSelect
                                            trackedEntityType={
                                                this.props.trackedEntityType
                                            }
                                            value={relationshipType}
                                            onChange={
                                                setTrackedEntityRelationshipType
                                            }
                                            className={cx(
                                                styles.select,
                                                styles.indent
                                            )}
                                        />
                                    </Fragment>
                                )}
                            </div>
                        ))}
                    {tab === 'period' && (
                        <div className={styles.flexRowFlow}>
                            <PeriodTypeSelect />
                            <StartEndDate
                                startDate={startDate}
                                endDate={endDate}
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                                periodsSettings={periodsSettings}
                            />
                            {periodError && (
                                <div key="error" className={styles.error}>
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
                                        onChange={setEventPointColor}
                                        className={styles.flexInnerColumn}
                                    />
                                    <NumberField
                                        label={i18n.t('Point size')}
                                        value={eventPointRadius || TEI_RADIUS}
                                        onChange={setEventPointRadius}
                                        className={styles.flexInnerColumn}
                                    />
                                </div>
                                <BufferRadius defaultRadius={TEI_BUFFER} />

                                {relationshipType ? (
                                    <Fragment>
                                        <div className={styles.header}>
                                            {i18n.t('Related entity style')}:
                                        </div>
                                        <div
                                            className={
                                                styles.flexInnerColumnFlow
                                            }
                                        >
                                            <ColorPicker
                                                label={i18n.t('Color')}
                                                color={
                                                    relatedPointColor ||
                                                    TEI_RELATED_COLOR
                                                }
                                                onChange={setRelatedPointColor}
                                                className={
                                                    styles.flexInnerColumn
                                                }
                                            />
                                            <NumberField
                                                label={i18n.t('Point size')}
                                                min={MIN_RADIUS}
                                                max={MAX_RADIUS}
                                                value={
                                                    relatedPointRadius ||
                                                    TEI_RELATED_RADIUS
                                                }
                                                onChange={setRelatedPointRadius}
                                                className={
                                                    styles.flexInnerColumn
                                                }
                                            />
                                            <ColorPicker
                                                label={i18n.t('Line Color')}
                                                color={
                                                    relationshipLineColor ||
                                                    TEI_RELATIONSHIP_LINE_COLOR
                                                }
                                                onChange={
                                                    setRelationshipLineColor
                                                }
                                                className={
                                                    styles.flexInnerColumn
                                                }
                                            />
                                        </div>
                                    </Fragment>
                                ) : null}
                            </div>
                            <div className={styles.flexColumn} />
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
        const { trackedEntityType, rows, startDate, endDate } = this.props

        if (!trackedEntityType) {
            return this.setErrorState(
                'trackedEntityTypeError',
                i18n.t('This field is required'),
                'data'
            )
        }

        const error = getStartEndDateError(startDate, endDate)
        if (error) {
            return this.setErrorState('periodError', error, 'period')
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected.'),
                'orgunits'
            )
        }

        return true
    }
}

export default connect(
    null,
    {
        setTrackedEntityType,
        setProgram,
        setProgramStatus,
        setFollowUpStatus,
        setTrackedEntityRelationshipType,
        setTrackedEntityRelationshipOutsideProgram,
        setStartDate,
        setEndDate,
        setOrgUnits,
        setEventPointColor,
        setEventPointRadius,
        setRelatedPointColor,
        setRelatedPointRadius,
        setRelationshipLineColor,
        setStyleDataItem,
    },
    null,
    {
        forwardRef: true,
    }
)(TrackedEntityDialog)
