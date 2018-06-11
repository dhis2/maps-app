import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
// import { TextField } from '@dhis2/d2-ui-core'; // TODO: Don't accept numbers as values
import TextField from 'material-ui/TextField';
import Checkbox from '../d2-ui/Checkbox';
import FontStyle from '../d2-ui/FontStyle';
import OrgUnitGroupSetSelect from '../orgunits/OrgUnitGroupSetSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import { layerDialogStyles } from './LayerDialogStyles';

import {
    setOrganisationUnitGroupSet,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
    toggleOrgUnit,
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
    setAreaRadius,
} from '../../actions/layerEdit';

import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitGroupsFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics';

const styles = {
    ...layerDialogStyles,
    wrapper: {
        width: '100%',
        clear: 'both',
        height: 64,
    },
    checkbox: {
        float: 'left',
        margin: '24px 0 0 12px',
        width: 180,
    },
    font: {
        float: 'left',
        marginTop: 5,
    },
    radius: {
        width: 206,
        marginTop: 12,
    },
    help: {
        marginTop: 10,
    },
    error: {
        marginTop: 10,
        color: 'red',
    },
};

class FacilityDialog extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'group',
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

    onShowBufferClick(isChecked) {
        const { setAreaRadius, areaRadius } = this.props;

        setAreaRadius(isChecked ? areaRadius || 5000 : null);
    }

    render() {
        const {
            rows = [],
            organisationUnitGroupSet,
            labels,
            labelFontColor,
            labelFontSize,
            labelFontWeight,
            labelFontStyle,
            areaRadius,
            setOrganisationUnitGroupSet,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setUserOrgUnits,
            toggleOrgUnit,
            setLabels,
            setLabelFontColor,
            setLabelFontSize,
            setLabelFontWeight,
            setLabelFontStyle,
            setAreaRadius,
        } = this.props;

        const {
            tab,
            orgUnitGroupSetError,
            orgUnitsError,
            showBuffer,
        } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        return (
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={tab => this.setState({ tab })}
            >
                <Tab value="group" label={i18n.t('Group set')}>
                    <div style={styles.flexColumnFlow}>
                        <OrgUnitGroupSetSelect
                            value={organisationUnitGroupSet}
                            onChange={setOrganisationUnitGroupSet}
                            style={styles.select}
                            errorText={orgUnitGroupSetError}
                        />
                    </div>
                </Tab>
                <Tab value="orgunits" label={i18n.t('Organisation units')}>
                    <div style={styles.flex}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrgUnit}
                                disabled={
                                    selectedUserOrgUnits.length ? true : false
                                }
                            />
                        </div>
                        <div style={styles.flexHalf}>
                            <OrgUnitLevelSelect
                                orgUnitLevel={getOrgUnitLevelsFromRows(rows)}
                                onChange={setOrgUnitLevels}
                            />
                            <OrgUnitGroupSelect
                                orgUnitGroup={getOrgUnitGroupsFromRows(rows)}
                                onChange={setOrgUnitGroups}
                            />
                            <UserOrgUnitsSelect
                                selected={selectedUserOrgUnits}
                                onChange={setUserOrgUnits}
                            />
                            {!orgUnits.length && orgUnitsError ? (
                                <div style={styles.error}>{orgUnitsError}</div>
                            ) : (
                                <div style={styles.help}>
                                    {i18n.t(
                                        'Remember to select the organisation unit level containing the facilities.'
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Tab>
                <Tab value="style" label={i18n.t('Style')}>
                    <div style={styles.flex}>
                        <div style={styles.wrapper}>
                            <Checkbox
                                label={i18n.t('Show labels')}
                                checked={labels}
                                onCheck={setLabels}
                                style={styles.checkbox}
                            />
                            {labels && (
                                <FontStyle
                                    color={labelFontColor}
                                    size={labelFontSize}
                                    weight={labelFontWeight}
                                    fontStyle={labelFontStyle}
                                    onColorChange={setLabelFontColor}
                                    onSizeChange={setLabelFontSize}
                                    onWeightChange={setLabelFontWeight}
                                    onStyleChange={setLabelFontStyle}
                                    style={styles.font}
                                />
                            )}
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
                                    id="radius"
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
        const { organisationUnitGroupSet, rows } = this.props;

        if (!organisationUnitGroupSet) {
            return this.setErrorState(
                'orgUnitGroupSetError',
                i18n.t('Group set is required'),
                'group'
            );
        }

        if (!getOrgUnitsFromRows(rows).length) {
            return this.setErrorState(
                'orgUnitsError',
                i18n.t('No organisation units are selected'),
                'orgunits'
            );
        }

        return true;
    }
}

export default connect(
    null,
    {
        setOrganisationUnitGroupSet,
        setOrgUnitLevels,
        setOrgUnitGroups,
        setUserOrgUnits,
        toggleOrgUnit,
        setLabels,
        setLabelFontColor,
        setLabelFontSize,
        setLabelFontWeight,
        setLabelFontStyle,
        setAreaRadius,
    },
    null,
    {
        withRef: true,
    }
)(FacilityDialog);
