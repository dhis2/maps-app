import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '../core/Tabs';
import Tab from '../core/Tab';
import NumberField from '../core/NumberField';
import Checkbox from '../core/Checkbox';
import FontStyle from '../core/FontStyle';
import OrgUnitGroupSetSelect from '../orgunits/OrgUnitGroupSetSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import layerDialogStyles from './LayerDialogStyles';

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
    help: {
        marginTop: 10,
        fontSize: 14,
    },
};

class FacilityDialog extends Component {
    static propTypes = {
        areaRadius: PropTypes.number,
        labels: PropTypes.bool,
        labelFontColor: PropTypes.string,
        labelFontSize: PropTypes.string,
        labelFontStyle: PropTypes.string,
        labelFontWeight: PropTypes.string,
        organisationUnitGroupSet: PropTypes.object,
        rows: PropTypes.array,
        setAreaRadius: PropTypes.func.isRequired,
        setLabels: PropTypes.func.isRequired,
        setLabelFontColor: PropTypes.func.isRequired,
        setLabelFontSize: PropTypes.func.isRequired,
        setLabelFontStyle: PropTypes.func.isRequired,
        setLabelFontWeight: PropTypes.func.isRequired,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setOrgUnitGroups: PropTypes.func.isRequired,
        setOrganisationUnitGroupSet: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'group',
            showBuffer: this.hasBuffer(props.areaRadius),
        };
    }

    UNSAFE_componentWillReceiveProps({ areaRadius }) {
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
        const hasUserOrgUnits = !!selectedUserOrgUnits.length;

        return (
            <div data-test="facilitydialog">
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="group">{i18n.t('Group Set')}</Tab>
                    <Tab
                        value="orgunits"
                        dataTest="facilitydialog-tabs-orgunits"
                    >
                        {i18n.t('Organisation Units')}
                    </Tab>
                    <Tab value="style">{i18n.t('Style')}</Tab>
                </Tabs>
                <div className={classes.tabContent}>
                    {tab === 'group' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="facilitydialog-grouptab"
                        >
                            <OrgUnitGroupSetSelect
                                value={organisationUnitGroupSet}
                                onChange={setOrganisationUnitGroupSet}
                                style={styles.select}
                                errorText={orgUnitGroupSetError}
                            />
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <div
                            style={styles.flexColumnFlow}
                            data-test="facilitydialog-orgunitstab"
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
                                {!orgUnits.length && orgUnitsError ? (
                                    <div style={styles.error}>
                                        {orgUnitsError}
                                    </div>
                                ) : (
                                    <div style={styles.help}>
                                        {i18n.t(
                                            'Remember to select the organisation unit level containing the facilities.'
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'style' && (
                        <div
                            style={styles.flexRowFlow}
                            data-test="facilitydialog-styletab"
                        >
                            <div style={styles.flexInnerColumnFlow}>
                                <Checkbox
                                    label={i18n.t('Labels')}
                                    checked={labels}
                                    onCheck={setLabels}
                                    style={{
                                        ...styles.flexInnerColumn,
                                        maxWidth: 150,
                                        height: 80,
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
                                            margin: '-20px 0 20px',
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
                                    }}
                                />
                                {showBuffer && (
                                    <NumberField
                                        label={i18n.t('Radius in meters')}
                                        value={areaRadius || ''}
                                        onChange={setAreaRadius}
                                        style={{
                                            maxWidth: 150,
                                            margin: '-14px 0',
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
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
        forwardRef: true,
    }
)(withStyles(styles)(FacilityDialog));
