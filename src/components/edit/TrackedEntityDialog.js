import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import SelectField from '../core/SelectField';
import DatePicker from '../core/DatePicker';
import Checkbox from '../core/Checkbox';
import TrackedEntityTypeSelect from '../trackedEntity/TrackedEntityTypeSelect';
import ProgramSelect from '../program/ProgramSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import SelectedOrgUnits from '../orgunits/SelectedOrgUnits';
import ColorPicker from '../core/ColorPicker';
import {
    TEI_START_DATE,
    TEI_END_DATE,
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
        classes: PropTypes.object.isRequired,
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
            startDate,
            endDate,
            programStatus,
            setStartDate,
            setEndDate,
            setProgramStatus,
        } = this.props;

        // Set default period (last year)
        if (!startDate && !endDate) {
            setStartDate(TEI_START_DATE);
            setEndDate(TEI_END_DATE);
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
        } = this.state;

        const periodHelp = program
            ? i18n.t('Select program period')
            : i18n.t('Select period when tracked entities were last updated');

        return (
            <div>
                <Tabs
                    value={tab}
                    onChange={(event, tab) => this.setState({ tab })}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                >
                    <Tab value="data" label={i18n.t('data')} className={classes.tab} />
                    <Tab value="period" label={i18n.t('period')} className={classes.tab} />
                    <Tab value="orgunits" label={i18n.t('Org units')} className={classes.tab} />
                    <Tab value="style" label={i18n.t('Style')} className={classes.tab} />
                </Tabs>
                <div className={classes.tabContent}>
                    {tab === 'data' && 
                        <div style={styles.flexRowFlow}>
                            <div style={{ marginTop: 24, fontSize: 14 }}>
                                {i18n.t(
                                    'This map layer is still experimental. Please provide your feedback on our'
                                )}&nbsp;
                                <a href="//www.dhis2.org/contact#mailing-lists">
                                    {i18n.t('mailing lists')}
                                </a>.
                            </div>
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
                                    onChange={status => setProgramStatus(status.id)}
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
                                    style={{ ...styles.checkbox, marginLeft: 24 }}
                                />
                            )}
                        </div>
                    }
                    {tab === 'period' && 
                        <div style={styles.flexRowFlow}>
                            <div style={{ marginTop: 24 }}>{periodHelp}:</div>
                            <DatePicker
                                key="startdate"
                                label={i18n.t('Start date')}
                                value={startDate}
                                default={TEI_START_DATE}
                                onChange={setStartDate}
                                style={styles.select}
                            />
                            <DatePicker
                                key="enddate"
                                label={i18n.t('End date')}
                                value={endDate}
                                default={TEI_END_DATE}
                                onChange={setEndDate}
                                style={styles.select}
                            />
                        </div>
                    }
 
                    {tab === 'orgunits' && 
                        <div style={styles.flexColumnFlow}>
                            <div
                                style={{ ...styles.flexColumn, overflow: 'hidden' }}
                            >
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                    selectRootAsDefault={
                                        getOrgUnitsFromRows(rows).length === 0
                                    }
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
                                        organisationUnitSelectionMode || 'SELECTED'
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
                    }
                    {tab === 'style' && 
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
                                        onChange={(evt, radius) =>
                                            setEventPointRadius(radius)
                                        }
                                        style={styles.flexInnerColumn}
                                    />
                                </div>
                                <div style={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Buffer')}
                                        checked={showBuffer}
                                        onCheck={this.onShowBufferClick}
                                        style={{
                                            ...styles.flexInnerColumn,
                                            marginTop: 47,
                                        }}
                                    />
                                    {showBuffer && (
                                        <TextField
                                            id="buffer"
                                            type="number"
                                            label={i18n.t(
                                                'Radius in meters'
                                            )}
                                            value={areaRadius || ''}
                                            onChange={(evt, radius) =>
                                                setAreaRadius(radius)
                                            }
                                            style={styles.flexInnerColumn}
                                            // floatingLabelStyle={{
                                            //     whiteSpace: 'nowrap',
                                            // }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div style={styles.flexColumn} />
                        </div>
                    }
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
        const { trackedEntityType, rows } = this.props;

        if (!trackedEntityType) {
            return this.setErrorState(
                'trackedEntityTypeError',
                i18n.t('This field is required'),
                'data'
            );
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
