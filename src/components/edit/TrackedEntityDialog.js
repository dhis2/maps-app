import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '../core/Tabs';
import Tab from '../core/Tab';
import TextField from '../core/TextField';
import SelectField from '../core/SelectField';
import DatePicker from '../core/DatePicker';
import Checkbox from '../core/Checkbox';
import TrackedEntityTypeSelect from '../trackedEntity/TrackedEntityTypeSelect';
import ProgramSelect from '../program/ProgramSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import SelectedOrgUnits from '../orgunits/SelectedOrgUnits';
import ColorPicker from '../core/ColorPicker';
import {
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
    TEI_COLOR,
    TEI_RADIUS,
    TEI_BUFFER,
} from '../../constants/layers';
import { layerDialogStyles } from './LayerDialogStyles';

import {
    setTrackedEntityType,
    setProgram,
    setProgramStatus,
    setFollowUpStatus,
    setStartDate,
    setEndDate,
    setOrgUnitRoot,
    toggleOrgUnit,
    setOrgUnitMode,
    setEventPointColor,
    setEventPointRadius,
    setAreaRadius,
    setStyleDataItem,
} from '../../actions/layerEdit';

import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
} from '../../util/analytics';
import { getStartEndDateError } from '../../util/time';

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
    error: {
        marginTop: 12,
        color: 'red',
    },
};

export class TrackedEntityDialog extends Component {
    static propTypes = {
        areaRadius: PropTypes.number,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        eventPointColor: PropTypes.string,
        eventPointRadius: PropTypes.number,
        followUp: PropTypes.bool,
        organisationUnitSelectionMode: PropTypes.string,
        program: PropTypes.object,
        programStatus: PropTypes.string,
        rows: PropTypes.array,
        trackedEntityType: PropTypes.object,
        setAreaRadius: PropTypes.func.isRequired,
        setEventPointColor: PropTypes.func.isRequired,
        setEventPointRadius: PropTypes.func.isRequired,
        setFollowUpStatus: PropTypes.func.isRequired,
        setProgram: PropTypes.func.isRequired,
        setProgramStatus: PropTypes.func.isRequired,
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
        };
    }

    componentDidMount() {
        const {
            rows,
            startDate,
            endDate,
            programStatus,
            setOrgUnitRoot,
            setStartDate,
            setEndDate,
            setProgramStatus,
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

        if (!programStatus) {
            setProgramStatus('ACTIVE');
        }
    }

    componentWillReceiveProps({ areaRadius }) {
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
        } = this.props;

        const {
            setTrackedEntityType,
            setProgram,
            setProgramStatus,
            setFollowUpStatus,
            setStartDate,
            setEndDate,
            toggleOrgUnit,
            setOrgUnitMode,
            setEventPointColor,
            setEventPointRadius,
            setAreaRadius,
        } = this.props;

        const { classes } = this.props;

        const {
            tab,
            trackedEntityTypeError,
            orgUnitsError,
            showBuffer,
            periodError,
        } = this.state;

        const periodHelp = program
            ? i18n.t('Select program period')
            : i18n.t('Select period when tracked entities were last updated');

        return (
            <div>
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="data" label={i18n.t('data')} />
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
                                <SelectField
                                    label={i18n.t('Program status')}
                                    items={[
                                        {
                                            id: 'ACTIVE',
                                            name: 'Active',
                                        },
                                        {
                                            id: 'COMPLETED',
                                            name: 'Completed',
                                        },
                                    ]}
                                    value={programStatus}
                                    onChange={status =>
                                        setProgramStatus(status.id)
                                    }
                                    style={{
                                        ...styles.select,
                                        width: 276,
                                        marginLeft: 24,
                                    }}
                                />
                            )}
                            {program && (
                                <Checkbox
                                    label={i18n.t('Follow up')}
                                    checked={followUp}
                                    onCheck={setFollowUpStatus}
                                    style={{
                                        ...styles.checkbox,
                                        marginLeft: 24,
                                    }}
                                />
                            )}
                        </div>
                    )}
                    {tab === 'period' && (
                        <div style={styles.flexRowFlow}>
                            <div style={{ margin: '12px 0', fontSize: 14 }}>
                                {periodHelp}:
                            </div>
                            <DatePicker
                                key="startdate"
                                label={i18n.t('Start date')}
                                value={startDate}
                                onChange={setStartDate}
                                style={styles.select}
                            />
                            <DatePicker
                                key="enddate"
                                label={i18n.t('End date')}
                                value={endDate}
                                onChange={setEndDate}
                                style={styles.select}
                            />
                            {periodError ? (
                                <div style={styles.error}>{periodError}</div>
                            ) : null}
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
                                            name: 'Selected only',
                                        },
                                        {
                                            id: 'CHILDREN',
                                            name: 'Selected and below',
                                        },
                                        {
                                            id: 'DESCENDANTS',
                                            name: 'Selected and all below',
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
        setStartDate,
        setEndDate,
        setOrgUnitRoot,
        toggleOrgUnit,
        setOrgUnitMode,
        setEventPointColor,
        setEventPointRadius,
        setAreaRadius,
        setStyleDataItem,
    },
    null,
    {
        withRef: true,
    }
)(withStyles(styles)(TrackedEntityDialog));
