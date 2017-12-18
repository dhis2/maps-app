import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import { Tabs, Tab } from 'd2-ui/lib/tabs/Tabs';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import TextField from 'd2-ui/lib/text-field/TextField';
import Checkbox from '../d2-ui/Checkbox';
import FontStyle from '../d2-ui/FontStyle';

import {
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
    toggleOrganisationUnit,
    setLabels,
    setLabelFontSize,
    setLabelFontStyle,
    setRadiusLow,
} from '../../actions/layerEdit';

import {
    getOrgUnitNodesFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitGroupsFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics';

const styles = {
    content: { // TODO: reuse styles
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
        padding: 12,
        height: 330,
        overflowY: 'auto',
    },
    flexHalf: {
        flex: '50%',
        minWidth: 230,
        boxSizing: 'border-box',
        borderLeft: '12px solid #fff',
        borderRight: '12px solid #fff',
    },
    flexFull: {
        flex: '100%',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
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
};

class BoundaryDialog extends Component {

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
            toggleOrganisationUnit,
            setLabels,
            setLabelFontSize,
            setLabelFontStyle,
            setRadiusLow,
        } = this.props;

        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        return (
            <Tabs>
                <Tab label={i18next.t('Organisation units')}>
                    <div style={styles.content}>
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
                    <div style={styles.content}>
                        <div style={styles.wrapper}>
                            <Checkbox
                                label={i18next.t('Show labels')}
                                checked={labels}
                                onCheck={setLabels}
                                style={styles.checkbox}
                            />
                            {labels &&
                                <FontStyle
                                    size={labelFontSize}
                                    fontStyle={labelFontStyle}
                                    onSizeChange={setLabelFontSize}
                                    onStyleChange={setLabelFontStyle}
                                    style={styles.font}
                                />
                            }
                        </div>
                        <TextField
                            type='number'
                            label={i18next.t('Point radius')}
                            value={radiusLow !== undefined ? radiusLow : 5}
                            onChange={setRadiusLow}
                            style={styles.radius}
                        />
                    </div>
                </Tab>
            </Tabs>
        );
    }
}

export default connect(
    null, {
        setOrgUnitLevels,
        setOrgUnitGroups,
        setUserOrgUnits,
        toggleOrganisationUnit,
        setLabels,
        setLabelFontSize,
        setLabelFontStyle,
        setRadiusLow,
    }
)(BoundaryDialog);
