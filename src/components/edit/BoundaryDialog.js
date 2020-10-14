import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '../core/Tabs';
import Tab from '../core/Tab';
import TextField from '../core/TextField';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import Checkbox from '../core/Checkbox';
import FontStyle from '../core/FontStyle';
import layerDialogStyles from './LayerDialogStyles';

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
};

class BoundaryDialog extends Component {
    static propTypes = {
        labels: PropTypes.bool,
        labelFontSize: PropTypes.string,
        labelFontStyle: PropTypes.string,
        radiusLow: PropTypes.number,
        rows: PropTypes.array,
        setLabels: PropTypes.func.isRequired,
        setLabelFontSize: PropTypes.func.isRequired,
        setLabelFontStyle: PropTypes.func.isRequired,
        setOrgUnitGroups: PropTypes.func.isRequired,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setRadiusLow: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    state = {
        tab: 'orgunits',
    };

    componentDidUpdate(prev) {
        const { validateLayer, onLayerValidation } = this.props;

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate());
        }
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

        const { classes } = this.props;

        const { tab, orgUnitsError } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const hasUserOrgUnits = !!selectedUserOrgUnits.length;

        return (
            <div data-test="boundarydialog">
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                    <Tab value="style">{i18n.t('Style')}</Tab>
                </Tabs>
                <div className={classes.tabContent}>
                    {tab === 'orgunits' && (
                        <div
                            style={styles.flexColumnFlow}
                            data-test="boundarydialog-orgunitstab"
                        >
                            <div
                                style={{
                                    ...styles.flexColumn,
                                    overflow: 'hidden',
                                }}
                            >
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                    disabled={hasUserOrgUnits}
                                />
                            </div>
                            <div style={styles.flexColumn}>
                                <OrgUnitLevelSelect
                                    orgUnitLevel={getOrgUnitLevelsFromRows(
                                        rows
                                    )}
                                    onChange={setOrgUnitLevels}
                                    disabled={hasUserOrgUnits}
                                />
                                <OrgUnitGroupSelect
                                    orgUnitGroup={getOrgUnitGroupsFromRows(
                                        rows
                                    )}
                                    onChange={setOrgUnitGroups}
                                    disabled={hasUserOrgUnits}
                                />
                                <UserOrgUnitsSelect
                                    selected={selectedUserOrgUnits}
                                    onChange={setUserOrgUnits}
                                />
                                {!orgUnits.length && orgUnitsError && (
                                    <div style={styles.error}>
                                        {orgUnitsError}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'style' && (
                        <div
                            style={styles.flexColumnFlow}
                            data-test="boundarydialog-styletab"
                        >
                            <div style={styles.flexColumn}>
                                <div style={styles.flexInnerColumnFlow}>
                                    <Checkbox
                                        label={i18n.t('Labels')}
                                        checked={labels}
                                        onCheck={setLabels}
                                        style={{
                                            ...styles.flexInnerColumn,
                                            maxWidth: 150,
                                            height: 48,
                                        }}
                                    />
                                    {labels && (
                                        <FontStyle
                                            size={labelFontSize}
                                            fontStyle={labelFontStyle}
                                            onSizeChange={setLabelFontSize}
                                            onStyleChange={setLabelFontStyle}
                                            style={styles.flexInnerColumn}
                                        />
                                    )}
                                </div>
                                <TextField
                                    id="radius"
                                    type="number"
                                    label={i18n.t('Point radius')}
                                    value={
                                        radiusLow !== undefined ? radiusLow : 5
                                    }
                                    onChange={setRadiusLow}
                                    style={styles.radius}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
        forwardRef: true,
    }
)(withStyles(styles)(BoundaryDialog));
