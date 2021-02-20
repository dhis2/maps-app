import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Tab, Tabs, NumberField, Checkbox, FontStyle, Help } from '../core';
import OrgUnitGroupSetSelect from '../orgunits/OrgUnitGroupSetSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import styles from './styles/LayerDialog.module.css';

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
                <div className={styles.tabContent}>
                    {tab === 'group' && (
                        <div
                            className={styles.flexRowFlow}
                            data-test="facilitydialog-grouptab"
                        >
                            <OrgUnitGroupSetSelect
                                value={organisationUnitGroupSet}
                                onChange={setOrganisationUnitGroupSet}
                                className={styles.select}
                                errorText={orgUnitGroupSetError}
                            />
                        </div>
                    )}
                    {tab === 'orgunits' && (
                        <div
                            className={styles.flexColumnFlow}
                            data-test="facilitydialog-orgunitstab"
                        >
                            <div className={styles.orgUnitTree}>
                                <OrgUnitTree
                                    selected={getOrgUnitNodesFromRows(rows)}
                                    onClick={toggleOrgUnit}
                                    disabled={hasUserOrgUnits}
                                />
                            </div>
                            <div className={styles.flexColumn}>
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
                                    <div className={styles.error}>
                                        {orgUnitsError}
                                    </div>
                                ) : (
                                    <Help>
                                        {i18n.t(
                                            'Remember to select the organisation unit level containing the facilities.'
                                        )}
                                    </Help>
                                )}
                            </div>
                        </div>
                    )}
                    {tab === 'style' && (
                        <div
                            className={styles.flexRowFlow}
                            data-test="facilitydialog-styletab"
                        >
                            <div className={styles.flexInnerColumnFlow}>
                                <Checkbox
                                    label={i18n.t('Labels')}
                                    checked={labels}
                                    onChange={setLabels}
                                    className={styles.checkboxInline}
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
                                        className={styles.fontInline}
                                    />
                                )}
                            </div>
                            <div className={styles.flexInnerColumnFlow}>
                                <Checkbox
                                    label={i18n.t('Buffer')}
                                    checked={showBuffer}
                                    onChange={this.onShowBufferClick.bind(this)}
                                    className={styles.checkboxInline}
                                />
                                {showBuffer && (
                                    <NumberField
                                        label={i18n.t('Radius in meters')}
                                        value={areaRadius || ''}
                                        onChange={setAreaRadius}
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
)(FacilityDialog);
