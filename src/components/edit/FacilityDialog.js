import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
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
        height: 80,
    },
    checkbox: {
        float: 'left',
        margin: '40px 0 0 12px',
        width: 180,
    },
    font: {
        float: 'left',
        marginTop: 2,
    },
    radius: {
        width: 206,
        marginTop: 2,
    },
    help: {
        marginTop: 10,
        fontSize: 14,
    },
    error: {
        marginTop: 10,
        color: 'red',
    },
};

class FacilityDialog extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

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

        const { classes } = this.props;

        const {
            tab,
            orgUnitGroupSetError,
            orgUnitsError,
            showBuffer,
        } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);

        return (
            <div>
                <Tabs
                    value={tab}
                    onChange={(event, tab) => this.setState({ tab })}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                >
                    <Tab value="group" label={i18n.t('Group set')} />
                    <Tab value="orgunits" label={i18n.t('Organisation units')} />
                    <Tab value="style" label={i18n.t('Style')} />
                </Tabs>
                <div className={classes.tabContent}>
                    {tab === 'group' && 
                        <div style={styles.flexRowFlow}>
                            <OrgUnitGroupSetSelect
                                value={organisationUnitGroupSet}
                                onChange={setOrganisationUnitGroupSet}
                                style={styles.select}
                                errorText={orgUnitGroupSetError}
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
                                    disabled={
                                        selectedUserOrgUnits.length ? true : false
                                    }
                                />
                            </div>
                            <div style={styles.flexColumn}>
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
                    }
                    {tab === 'style' && 
                        <div
                            style={{
                                ...styles.flexRowFlow,
                                marginTop: 16,
                            }}
                        >
                            <div style={styles.flexInnerColumnFlow}>
                                <Checkbox
                                    label={i18n.t('Labels')}
                                    checked={labels}
                                    onCheck={setLabels}
                                    style={{
                                        ...styles.flexInnerColumn,
                                        maxWidth: 150,
                                        paddingTop: 24,
                                        height: 42,
                                    }}
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
                                        style={{
                                            ...styles.flexInnerColumn,
                                            ...styles.font,
                                        }}
                                    />
                                )}
                            </div>
                            <div style={styles.flexInnerColumnFlow}>
                                <Checkbox
                                    label={i18n.t('Buffer')}
                                    checked={showBuffer}
                                    onCheck={this.onShowBufferClick.bind(this)}
                                    style={{
                                        ...styles.flexInnerColumn,
                                        maxWidth: 150,
                                        paddingTop: 24,
                                        height: 42,
                                    }}
                                />
                                {showBuffer && (
                                    <TextField
                                        id="radius"
                                        type="number"
                                        floatingLabelText={i18n.t(
                                            'Radius in meters'
                                        )}
                                        value={areaRadius || ''}
                                        onChange={(evt, radius) =>
                                            setAreaRadius(radius)
                                        }
                                        style={{
                                            ...styles.flexInnerColumn,
                                            ...styles.radius,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    }
                </div>
            </div>
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
)(withStyles(styles)(FacilityDialog));
