import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '../../core/Tabs';
import Tab from '../../core/Tab';
import TextField from '../../core/TextField';
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
import layerDialogStyles from '../LayerDialogStyles';

import {
    setTrackedEntityType,
    setProgram,
    setProgramStatus,
    setFollowUpStatus,
    setTrackedEntityRelationshipType,
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

const styles = {
    ...layerDialogStyles,
    checkbox: {
        float: 'left',
        marginTop: 16,
        width: 180,
    },
    indent: {
        marginLeft: 24,
    },
};

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
        setOrgUnitRoot: PropTypes.func.isRequired,
        setStartDate: PropTypes.func.isRequired,
        setEndDate: PropTypes.func.isRequired,
        setOrgUnitMode: PropTypes.func.isRequired,
        setTrackedEntityType: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
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
        } = this.props;

        const {
            setTrackedEntityType,
            setProgram,
            setProgramStatus,
            setFollowUpStatus,
            setTrackedEntityRelationshipType,
            toggleOrgUnit,
            setOrgUnitMode,
            setEventPointColor,
            setEventPointRadius,
            setAreaRadius,
            setRelatedPointColor,
            setRelatedPointRadius,
            setRelationshipLineColor,
        } = this.props;

        const { classes } = this.props;

        const {
            tab,
            trackedEntityTypeError,
            orgUnitsError,
            showBuffer,
            periodError,
        } = this.state;

        /*
        const periodHelp = program
            ? i18n.t('Select program period')
            : i18n.t('Select period when tracked entities were last updated');
        */

        return (
            <div>
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="data" label={i18n.t('data')} />
                    <Tab
                        value="relationships"
                        label={i18n.t('relationships')}
                    />
                    <Tab value="period" label={i18n.t('period')} />
                    <Tab value="orgunits" label={i18n.t('Org units')} />
                    <Tab value="style" label={i18n.t('Style')} />
                </Tabs>
                <div className={classes.tabContent}>
                    {tab === 'data' && (
                        <div style={styles.flexRowFlow}>
                            <TrackedEntityTypeSelect
                                trackedEntityType={trackedEntityType}
                                onChange={setTrackedEntityType}
                                style={styles.select}
                                errorText={trackedEntityTypeError}
                            />
                            {trackedEntityType && (
                                <ProgramSelect
                                    allPrograms={true}
                                    program={program}
                                    trackedEntityType={trackedEntityType}
                                    onChange={setProgram}
                                    style={styles.select}
                                />
                            )}
                            {program && (
                                <ProgramStatusSelect
                                    value={programStatus}
                                    onChange={setProgramStatus}
                                    style={styles.select}
                                />
                            )}
                            {program && (
                                <Checkbox
                                    label={i18n.t('Follow up')}
                                    checked={followUp}
                                    onCheck={setFollowUpStatus}
                                    style={styles.checkbox}
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
                            <div style={styles.flexRowFlow}>
                                <div
                                    style={{
                                        fontSize: 14,
                                        padding: '12px 12px 0',
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontWeight: 'bold',
                                            marginBottom: 8,
                                        }}
                                    >
                                        {i18n.t('WARNING')}
                                    </h3>
                                    <p>
                                        {i18n.t(
                                            'Displaying tracked entity relationships in Maps is an experimental feature'
                                        )}
                                    </p>
                                </div>
                                <Checkbox
                                    label={i18n.t(
                                        'Display Tracked Entity relationships'
                                    )}
                                    checked={
                                        this.state.showRelationshipsChecked
                                    }
                                    onCheck={checked => {
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
                                    <TrackedEntityRelationshipTypeSelect
                                        trackedEntityType={
                                            this.props.trackedEntityType
                                        }
                                        value={relationshipType}
                                        onChange={
                                            setTrackedEntityRelationshipType
                                        }
                                        style={{
                                            ...styles.select,
                                            width: 276,
                                            margin: '0 0 0 48px',
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    {tab === 'period' && (
                        <div style={styles.flexRowFlow}>
                            <PeriodTypeSelect program={program} />
                            <StartEndDates
                                startDate={startDate}
                                endDate={endDate}
                                errorText={periodError}
                            />
                        </div>
                    )}

                    {tab === 'orgunits' && (
                        <div style={styles.flexColumnFlow}>
                            <div
                                style={{
                                    ...styles.flexColumn,
                                    overflow: 'hidden',
                                }}
                            >
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                />
                            </div>
                            <div style={styles.flexColumn}>
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
                        <div style={styles.flexColumnFlow}>
                            <div style={styles.flexColumn}>
                                <div
                                    style={{
                                        ...styles.flexInnerColumnFlow,
                                        margin: '12px 0',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {i18n.t('Tracked entity style')}:
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <ColorPicker
                                        label={i18n.t('Color')}
                                        color={eventPointColor || TEI_COLOR}
                                        onChange={setEventPointColor}
                                        style={styles.flexInnerColumn}
                                    />
                                    <TextField
                                        id="radius"
                                        type="number"
                                        label={i18n.t('Point size')}
                                        value={eventPointRadius || TEI_RADIUS}
                                        onChange={setEventPointRadius}
                                        style={styles.flexInnerColumn}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Buffer')}
                                        checked={showBuffer}
                                        onCheck={this.onShowBufferClick}
                                        style={styles.flexInnerColumn}
                                    />
                                    {showBuffer && (
                                        <TextField
                                            id="buffer"
                                            type="number"
                                            label={i18n.t('Radius in meters')}
                                            value={areaRadius || ''}
                                            onChange={setAreaRadius}
                                            style={styles.flexInnerColumn}
                                        />
                                    )}
                                </div>
                                {relationshipType ? (
                                    <Fragment>
                                        <div
                                            style={{
                                                ...styles.flexInnerColumnFlow,
                                                margin: '12px 0',
                                                fontSize: 14,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {i18n.t('Related entity style')}:
                                        </div>
                                        <div style={styles.flexInnerColumnFlow}>
                                            <ColorPicker
                                                label={i18n.t('Color')}
                                                color={
                                                    relatedPointColor ||
                                                    TEI_RELATED_COLOR
                                                }
                                                onChange={setRelatedPointColor}
                                                style={styles.flexInnerColumn}
                                            />
                                            <TextField
                                                id="buffer"
                                                type="number"
                                                label={i18n.t('Point size')}
                                                value={
                                                    relatedPointRadius ||
                                                    TEI_RELATED_RADIUS
                                                }
                                                onChange={setRelatedPointRadius}
                                                style={styles.flexInnerColumn}
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
                                                style={styles.flexInnerColumn}
                                            />
                                        </div>
                                    </Fragment>
                                ) : null}
                            </div>
                            <div style={styles.flexColumn} />
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
)(withStyles(styles)(TrackedEntityDialog));
