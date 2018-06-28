import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
import { SelectField } from '@dhis2/d2-ui-core';
// import { TextField } from '@dhis2/d2-ui-core'; // TODO: Don't accept numbers as values
import TextField from 'material-ui/TextField';
import DatePicker from '../d2-ui/DatePicker';
import Checkbox from '../d2-ui/Checkbox';
import TrackedEntityTypeSelect from '../trackedEntity/TrackedEntityTypeSelect';
import ProgramSelect from '../program/ProgramSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import SelectedOrgUnits from '../orgunits/SelectedOrgUnits';
import ColorPicker from '../d2-ui/ColorPicker';
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
        // classes: PropTypes.number,
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
            trackedEntityType,
            program,
            programStatus,
            followUp,
            startDate,
            endDate,
            rows = [],
            ouMode,
            eventPointColor,
            eventPointRadius,
            areaRadius,
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
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={tab => this.setState({ tab })}
            >
                <Tab value="data" label={i18n.t('data')}>
                    <div style={styles.flexColumnFlow}>
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
                </Tab>
                <Tab value="period" label={i18n.t('period')}>
                    <div style={styles.flexColumnFlow}>
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
                </Tab>
                <Tab value="orgunits" label={i18n.t('Org units')}>
                    <div style={styles.flexRowFlow}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrgUnit}
                                selectRootAsDefault={
                                    getOrgUnitsFromRows(rows).length === 0
                                }
                            />
                        </div>
                        <div style={styles.flexHalf}>
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
                                value={ouMode || 'SELECTED'}
                                onChange={mode => setOrgUnitMode(mode.id)}
                                style={{
                                    width: '100%',
                                }}
                            />

                            <SelectedOrgUnits
                                rows={rows}
                                mode={ouMode}
                                units={i18n.t('Tracked entities')}
                                error={orgUnitsError}
                            />
                        </div>
                    </div>
                </Tab>
                <Tab value="style" label={i18n.t('Style')}>
                    <div style={styles.flexColumnFlow}>
                        <div style={{ marginLeft: 3 }}>
                            <div
                                style={{
                                    marginTop: 20,
                                    marginRight: 20,
                                    float: 'left',
                                }}
                            >
                                <div style={styles.colorLabel}>
                                    {i18n.t('Color')}
                                </div>
                                <ColorPicker
                                    color={eventPointColor || TEI_COLOR}
                                    onChange={setEventPointColor}
                                    style={{ width: 64, height: 32 }}
                                />
                            </div>
                            <TextField
                                id="radius"
                                type="number"
                                floatingLabelText={i18n.t('Point size')}
                                value={eventPointRadius || TEI_RADIUS}
                                onChange={(evt, radius) =>
                                    setEventPointRadius(radius)
                                }
                                style={{
                                    float: 'left',
                                    maxWidth: 100,
                                    marginTop: 8,
                                }}
                            />
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <Checkbox
                                label={i18n.t('Show buffer')}
                                checked={showBuffer}
                                onCheck={this.onShowBufferClick}
                                style={styles.checkbox}
                            />
                            {showBuffer && (
                                <TextField
                                    id="radius"
                                    type="number"
                                    floatingLabelText={i18n.t(
                                        'Buffer in meters'
                                    )}
                                    value={areaRadius || ''}
                                    onChange={(evt, radius) =>
                                        setAreaRadius(radius)
                                    }
                                    style={{
                                        float: 'left',
                                        maxWidth: 150,
                                        marginTop: -24,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </Tab>
            </Tabs>
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
    },
    null,
    {
        withRef: true,
    }
)(TrackedEntityDialog);
