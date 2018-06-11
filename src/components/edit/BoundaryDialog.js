import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tabs, Tab } from 'material-ui/Tabs';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
// import { TextField } from '@dhis2/d2-ui-core'; // TODO: Don't accept numbers as values
import TextField from 'material-ui/TextField';
import Checkbox from '../d2-ui/Checkbox';
import FontStyle from '../d2-ui/FontStyle';
import { layerDialogStyles } from './LayerDialogStyles';

import {
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
    toggleOrgUnit,
    setLabels,
    setLabelFontSize,
    setLabelFontStyle,
    setRadiusLow,
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
    tabs: {
        height: 376,
    },
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
        marginLeft: 12,
        width: 127,
    },
    error: {
        marginTop: 10,
        color: 'red',
    },
};

class BoundaryDialog extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'orgunits',
        };
    }

    render() {
        const {
            rows = [],
            labels,
            labelFontSize,
            labelFontStyle,
            radiusLow,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setUserOrgUnits,
            toggleOrgUnit,
            setLabels,
            setLabelFontSize,
            setLabelFontStyle,
            setRadiusLow,
        } = this.props;

        const { tab, orgUnitsError } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        return (
            <Tabs
                style={styles.tabs}
                tabItemContainerStyle={styles.tabBar}
                value={tab}
                onChange={tab => this.setState({ tab })}
            >
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
                            {!orgUnits.length &&
                                orgUnitsError && (
                                    <div style={styles.error}>
                                        {orgUnitsError}
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
                                    size={labelFontSize}
                                    fontStyle={labelFontStyle}
                                    onSizeChange={setLabelFontSize}
                                    onStyleChange={setLabelFontStyle}
                                    style={styles.font}
                                />
                            )}
                        </div>
                        <TextField
                            id="radius"
                            type="number"
                            floatingLabelText={i18n.t('Point radius')}
                            value={radiusLow !== undefined ? radiusLow : 5}
                            onChange={(evt, radius) => setRadiusLow(radius)}
                            style={styles.radius}
                        />
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
        const { rows } = this.props;

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
        setOrgUnitLevels,
        setOrgUnitGroups,
        setUserOrgUnits,
        toggleOrgUnit,
        setLabels,
        setLabelFontSize,
        setLabelFontStyle,
        setRadiusLow,
    },
    null,
    {
        withRef: true,
    }
)(BoundaryDialog);
