import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { NoticeBox } from '@dhis2/ui';
import cx from 'classnames';
import Tabs from '../../core/Tabs';
import Tab from '../../core/Tab';
import NumberField from '../../core/NumberField';
import SelectField from '../../core/SelectField';
import Checkbox from '../../core/Checkbox';
import TrackedEntityTypeSelect from '../../trackedEntity/TrackedEntityTypeSelect';
import TrackedEntityRelationshipTypeSelect from './TrackedEntityRelationshipTypeSelect';
import ProgramSelect from '../../program/ProgramSelect';
import ProgramStatusSelect from './ProgramStatusSelect';
import PeriodTypeSelect from './PeriodTypeSelect';
import StartEndDates from '../../periods/StartEndDates';
import OrgUnitTree from '../../orgunits/OrgUnitTree';
import SelectedOrgUnits from '../../orgunits/SelectedOrgUnits';
import ColorPicker from '../../core/ColorPicker';
import styles from '../styles/LayerDialog.module.css';

import {
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
    TEI_COLOR,
    TEI_RADIUS,
    TEI_BUFFER,
    TEI_RELATED_COLOR,
    TEI_RELATIONSHIP_LINE_COLOR,
    TEI_RELATED_RADIUS,
} from '../../../constants/layers';

import {
    setTrackedEntityType,
    setProgram,
    setProgramStatus,
    setFollowUpStatus,
    setTrackedEntityRelationshipType,
    setTrackedEntityRelationshipOutsideProgram,
    setStartDate,
    setEndDate,
    setOrgUnitRoot,
    toggleOrgUnit,
    setOrgUnitMode,
    setEventPointColor,
    setEventPointRadius,
    setAreaRadius,
    setRelatedPointColor,
    setRelatedPointRadius,
    setRelationshipLineColor,
    setStyleDataItem,
} from '../../../actions/layerEdit';

import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
} from '../../../util/analytics';
import { getStartEndDateError } from '../../../util/time';

export class TrackedEntityDialog extends Component {
    static propTypes = {
        areaRadius: PropTypes.number,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        eventPointColor: PropTypes.string,
        eventPointRadius: PropTypes.number,
        relatedPointColor: PropTypes.string,
        relatedPointRadius: PropTypes.number,
        relationshipLineColor: PropTypes.string,
        followUp: PropTypes.bool,
        relationshipType: PropTypes.string,
        relationshipOutsideProgram: PropTypes.bool,
        organisationUnitSelectionMode: PropTypes.string,
        program: PropTypes.object,
        programStatus: PropTypes.string,
        rows: PropTypes.array,
        trackedEntityType: PropTypes.object,
        setAreaRadius: PropTypes.func.isRequired,
        setEventPointColor: PropTypes.func.isRequired,
        setEventPointRadius: PropTypes.func.isRequired,
        setRelatedPointColor: PropTypes.func.isRequired,
        setRelatedPointRadius: PropTypes.func.isRequired,
        setRelationshipLineColor: PropTypes.func.isRequired,
        setFollowUpStatus: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setProgramStatus: PropTypes.func.isRequired,
        setTrackedEntityRelationshipType: PropTypes.func.isRequired,
        setTrackedEntityRelationshipOutsideProgram: PropTypes.func.isRequired,
        setOrgUnitRoot: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        setEndDate: PropTypes.func.isRequired,
        setOrgUnitMode: PropTypes.func.isRequired,
        setTrackedEntityType: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data',
            showBuffer: this.hasBuffer(props.areaRadius),
            showRelationshipsChecked: false,
        };
    }

    componentDidMount() {
        const {
            rows,
            startDate,
            endDate,
            relationshipType,
            setOrgUnitRoot,
            setStartDate,
            setEndDate,
        } = this.props;

        const orgUnits = getOrgUnitNodesFromRows(rows);

        // Set org unit tree root as default
        if (orgUnits.length === 0) {
            setOrgUnitRoot();
        }

        // Set default period (last year)
        if (!startDate && !endDate) {
            setStartDate(DEFAULT_START_DATE);
            setEndDate(DEFAULT_END_DATE);
        }

        if (relationshipType) {
            this.setState({
                showRelationshipsChecked: true,
            });
        }
    }

    UNSAFE_componentWillReceiveProps({ areaRadius }) {
        if (areaRadius !== this.props.areaRadius) {
            this.setState({
                showBuffer: this.hasBuffer(areaRadius),
            });
        }
    }

    componentDidUpdate(prev) {
        const { validateLayer, onLayerValidation } = this.props;

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate());
        }
    }

    render() {
        const {
            areaRadius,
            endDate,
            eventPointColor,
            eventPointRadius,
            followUp,
            organisationUnitSelectionMode,
            program,
            programStatus,
            rows = [],
            startDate,
            trackedEntityType,
            relationshipType,
            relatedPointColor,
            relatedPointRadius,
            relationshipLineColor,
            // relationshipOutsideProgram,
        } = this.props;

        const {
            setTrackedEntityType,
            setProgram,
            setProgramStatus,
            setFollowUpStatus,
            setTrackedEntityRelationshipType,
            // setTrackedEntityRelationshipOutsideProgram,
            toggleOrgUnit,
            setOrgUnitMode,
            setEventPointColor,
            setEventPointRadius,
            setAreaRadius,
            setRelatedPointColor,
            setRelatedPointRadius,
            setRelationshipLineColor,
        } = this.props;

        const {
            tab,
            trackedEntityTypeError,
            orgUnitsError,
            showBuffer,
            periodError,
        } = this.state;

        return (
            <div>
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
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
                                    className={styles.checkbox}
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
                                    onChange={checked => {
                                        if (!checked) {
                                            setTrackedEntityRelationshipType(
                                                null
                                            );
                                        }
                                        this.setState({
                                            showRelationshipsChecked: checked,
                                        });
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
                                        {/*program && (
                                            <Checkbox
                                                label={i18n.t(
                                                    'Include relationships that connect entities outside "{{program}}" program',
                                                    {
                                                        program: program.name,
                                                    }
                                                )}
                                                checked={
                                                    relationshipOutsideProgram ===
                                                    true
                                                }
                                                onChange={
                                                    setTrackedEntityRelationshipOutsideProgram
                                                }
                                                style={{
                                                    marginTop: 30,
                                                }}
                                            />
                                        )*/}
                                    </Fragment>
                                )}
                            </div>
                        ))}
                    {tab === 'period' && (
                        <div className={styles.flexRowFlow}>
                            <PeriodTypeSelect />
                            <StartEndDates
                                startDate={startDate}
                                endDate={endDate}
                                errorText={periodError}
                            />
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <div className={styles.flexColumnFlow}>
                            <div className={styles.orgUnitTree}>
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                />
                            </div>
                            <div className={styles.flexColumn}>
                                <SelectField
                                    label={i18n.t('Selection mode')}
                                    items={[
                                        {
                                            id: 'SELECTED',
                                            name: i18n.t('Selected only'),
                                        },
                                        {
                                            id: 'CHILDREN',
                                            name: i18n.t('Selected and below'),
                                        },
                                        {
                                            id: 'DESCENDANTS',
                                            name: i18n.t(
                                                'Selected and all below'
                                            ),
                                        },
                                    ]}
                                    value={
                                        organisationUnitSelectionMode ||
                                        'SELECTED'
                                    }
                                    onChange={mode => setOrgUnitMode(mode.id)}
                                    style={{
                                        width: '100%',
                                    }}
                                />

                                <SelectedOrgUnits
                                    rows={rows}
                                    mode={organisationUnitSelectionMode}
                                    units={i18n.t('Tracked entities')}
                                    error={orgUnitsError}
                                />
                            </div>
                        </div>
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
                                <div className={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Buffer')}
                                        checked={showBuffer}
                                        onChange={this.onShowBufferClick}
                                        className={styles.checkboxInline}
                                    />
                                    {showBuffer && (
                                        <NumberField
                                            label={i18n.t('Radius in meters')}
                                            value={areaRadius || ''}
                                            onChange={setAreaRadius}
                                            className={styles.radius}
                                        />
                                    )}
                                </div>
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
        );
    }

    onShowBufferClick = isChecked => {
        const { setAreaRadius, areaRadius } = this.props;
        setAreaRadius(isChecked ? areaRadius || TEI_BUFFER : null);
    };

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
        const { trackedEntityType, rows, startDate, endDate } = this.props;

        if (!trackedEntityType) {
            return this.setErrorState(
                'trackedEntityTypeError',
                i18n.t('This field is required'),
                'data'
            );
        }

        const error = getStartEndDateError(startDate, endDate);
        if (error) {
            return this.setErrorState('periodError', error, 'period');
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
        setTrackedEntityType,
        setProgram,
        setProgramStatus,
        setFollowUpStatus,
        setTrackedEntityRelationshipType,
        setTrackedEntityRelationshipOutsideProgram,
        setStartDate,
        setEndDate,
        setOrgUnitRoot,
        toggleOrgUnit,
        setOrgUnitMode,
        setEventPointColor,
        setEventPointRadius,
        setAreaRadius,
        setRelatedPointColor,
        setRelatedPointRadius,
        setRelationshipLineColor,
        setStyleDataItem,
    },
    null,
    {
        forwardRef: true,
    }
)(TrackedEntityDialog);
