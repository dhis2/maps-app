import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import { Tabs, Tab } from 'd2-ui/lib/tabs/Tabs';
import TextField from 'd2-ui/lib/text-field/TextField';
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
    toggleOrganisationUnit,
    setLabels,
    setLabelFontColor,
    setLabelFontSize,
    setLabelFontWeight,
    setLabelFontStyle,
    setAreaRadius,
} from '../../actions/layerEdit';

import {
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
        marginTop: -8,
    },
    radius: {
        width: 206,
        marginTop: -8,
    }
};

class FacilityDialog extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'data'
        };
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
            toggleOrganisationUnit,
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
        } = this.state;

        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        return (
            <Tabs style={styles.tabs} value={tab} onChange={(tab) => this.setState({ tab })}>
                <Tab label={i18next.t('Group set')}>
                    <div style={styles.flex}>
                        <OrgUnitGroupSetSelect
                            value={organisationUnitGroupSet}
                            onChange={setOrganisationUnitGroupSet}
                            style={styles.flexHalf}
                            errorText={orgUnitGroupSetError}
                        />
                    </div>
                </Tab>
                <Tab label={i18next.t('Organisation units')}>
                    <div style={styles.flex}>
                        <div style={styles.flexHalf}>
                            <OrgUnitTree
                                selected={getOrgUnitNodesFromRows(rows)}
                                onClick={toggleOrganisationUnit}
                                disabled={selectedUserOrgUnits.length ? true : false}
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
                        </div>
                    </div>
                </Tab>
                <Tab label={i18next.t('Style')}>
                    <div style={styles.flex}>
                        <div style={styles.wrapper}>
                            <Checkbox
                                label={i18next.t('Show labels')}
                                checked={labels}
                                onCheck={setLabels}
                                style={styles.checkbox}
                            />
                            {labels &&
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
                            }
                        </div>
                        <div style={styles.labelWrapper}>
                            <Checkbox
                                label={i18next.t('Show buffer')}
                                checked={areaRadius === null || areaRadius === undefined ? false : true}
                                onCheck={checked => setAreaRadius(checked ? areaRadius || 5000 : null)}
                                style={styles.checkbox}
                            />
                            {(areaRadius !== null && areaRadius !== undefined) &&
                                <TextField
                                    type='number'
                                    label={i18next.t('Radius in meters')}
                                    value={areaRadius || ''}
                                    onChange={setAreaRadius}
                                    style={styles.radius}
                                />
                            }
                        </div>
                    </div>
                </Tab>
            </Tabs>
        );
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
        const { organisationUnitGroupSet } = this.props;

        if (!organisationUnitGroupSet) {
            return this.setErrorState('orgUnitGroupSetError', i18next.t('Group set is required'), 'data');
        }

        return true;
    }
}

export default connect(
    null, {
        setOrganisationUnitGroupSet,
        setOrgUnitLevels,
        setOrgUnitGroups,
        setUserOrgUnits,
        toggleOrganisationUnit,
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
