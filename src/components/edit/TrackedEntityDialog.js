import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
// import { TextField } from '@dhis2/d2-ui-core'; // TODO: Don't accept numbers as values
import TextField from 'material-ui/TextField'; 
import Checkbox from '../d2-ui/Checkbox';
import TrackedEntityTypeSelect from '../trackedEntity/TrackedEntityTypeSelect';
import ProgramSelect from '../program/ProgramSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import SelectedOrgUnits from '../orgunits/SelectedOrgUnits';
import ColorPicker from '../d2-ui/ColorPicker';
import { TEI_COLOR, TEI_RADIUS } from '../../constants/layers';
import { layerDialogStyles } from './LayerDialogStyles';

import { 
    setTrackedEntityType, 
    setProgram, 
    toggleOrganisationUnit,     
    setEventPointColor,
    setEventPointRadius, 
    setAreaRadius,
} from '../../actions/layerEdit';

import { 
    getOrgUnitsFromRows, 
    getOrgUnitNodesFromRows 
} from '../../util/analytics';

const styles = {
    ...layerDialogStyles,
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
            rows = [], 
            eventPointColor,
            eventPointRadius,
            areaRadius,
        } = this.props;

        console.log('areaRadius', areaRadius);

        const { 
            setTrackedEntityType, 
            setProgram,
            toggleOrganisationUnit, 
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

        return (
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={tab => this.setState({ tab })}
            >
                <Tab value="data" label={i18n.t('data')}>
                    <div style={styles.flexColumnFlow}>
                        <TrackedEntityTypeSelect 
                            trackedEntityType={trackedEntityType}
                            onChange={setTrackedEntityType} 
                            style={styles.select}
                            errorText={trackedEntityTypeError}
                        />
                        <ProgramSelect
                            allPrograms={true}
                            program={program}
                            onChange={setProgram}
                            style={styles.select}
                        />
                    </div>
                </Tab>
                <Tab value="period" label={i18n.t('period')} />
                <Tab value="filter" label={i18n.t('Filter')} />
                <Tab value="orgunits" label={i18n.t('Org units')}>
                    <div style={styles.flexRowFlow}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrganisationUnit}
                                selectRootAsDefault={
                                    getOrgUnitsFromRows(rows).length === 0
                                }
                            />
                        </div>
                        <div style={styles.flexHalf}>
                            <SelectedOrgUnits
                                rows={rows}
                                units={i18n.t('Tracked entities')}
                                error={orgUnitsError}
                            />
                        </div>
                    </div>
                </Tab>
                <Tab value="style" label={i18n.t('Style')}>
                    <div style={styles.flexColumnFlow}>
                        <div style={{ marginLeft: 3 }}>
                            <div style={{ marginTop: 20, marginRight: 20, float: 'left' }}>
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
                                label={i18n.t('Radius')}
                                value={eventPointRadius || TEI_RADIUS}
                                // onChange={setEventPointRadius}
                                onChange={console.log}
                                style={{ float: 'left', maxWidth: 100, marginTop: 30 }}
                            />
                        </div>
                        <div style={styles.labelWrapper}>
                            <Checkbox
                                label={i18n.t('Show buffer')}
                                checked={showBuffer}
                                onCheck={this.onShowBufferClick.bind(this)}
                                style={styles.checkbox}
                            />
                            {showBuffer && (
                                <TextField
                                    id='radius'
                                    type="number"
                                    label={i18n.t('Radius in meters')}
                                    value={areaRadius || ''}
                                    onChange={setAreaRadius}
                                    style={styles.radius}
                                />
                            )}
                        </div>
                    </div>
                </Tab>
            </Tabs>
        );
    }

    onShowBufferClick(isChecked) {
        const { setAreaRadius, areaRadius } = this.props;
        setAreaRadius(isChecked ? areaRadius || 500 : null);
    }

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
        toggleOrganisationUnit,
        setEventPointColor,
        setEventPointRadius,
        setAreaRadius,
    },   
    null,
    {
        withRef: true,
    }
)(TrackedEntityDialog);
