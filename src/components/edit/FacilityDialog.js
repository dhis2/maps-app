import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import cx from 'classnames';
import { Tab, Tabs, Help, NumberField, ColorPicker } from '../core';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import Labels from './shared/Labels';
import BufferRadius from './shared/BufferRadius';
import StyleByGroupSet from '../groupSet/StyleByGroupSet';
import {
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS,
    FACILITY_BUFFER,
    STYLE_TYPE_SYMBOL,
} from '../../constants/layers';
import styles from './styles/LayerDialog.module.css';

import {
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
    toggleOrgUnit,
    setRadiusLow,
    setOrganisationUnitGroupSet,
    setOrganisationUnitColor,
} from '../../actions/layerEdit';

import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitGroupsFromRows,
    getUserOrgUnitsFromRows,
} from '../../util/analytics';

import { fetchFacilityConfigurations } from '../../util/orgUnits';

class FacilityDialog extends Component {
    static propTypes = {
        id: PropTypes.string,
        rows: PropTypes.array,
        radiusLow: PropTypes.number,
        organisationUnitColor: PropTypes.string,
        organisationUnitGroupSet: PropTypes.object,
        setOrgUnitLevels: PropTypes.func.isRequired,
        setOrgUnitGroups: PropTypes.func.isRequired,
        setUserOrgUnits: PropTypes.func.isRequired,
        toggleOrgUnit: PropTypes.func.isRequired,
        setRadiusLow: PropTypes.func.isRequired,
        setOrganisationUnitGroupSet: PropTypes.func.isRequired,
        setOrganisationUnitColor: PropTypes.func.isRequired,
        onLayerValidation: PropTypes.func.isRequired,
        validateLayer: PropTypes.bool.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            tab: 'orgunits',
        };
    }

    componentDidMount() {
        fetchFacilityConfigurations().then(config => this.setState(config));
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            id,
            rows,
            setOrgUnitLevels,
            organisationUnitGroupSet,
            setOrganisationUnitGroupSet,
            validateLayer,
            onLayerValidation,
        } = this.props;

        const { facilityOrgUnitLevel, facilityOrgUnitGroupSet } = this.state;

        // If new layer
        if (!id) {
            // Set default org unit level
            if (
                !getOrgUnitsFromRows(rows).length &&
                facilityOrgUnitLevel &&
                !prevState.facilityOrgUnitLevel
            ) {
                setOrgUnitLevels([facilityOrgUnitLevel.id]);
            }

            // Set default org unit group set
            if (
                !organisationUnitGroupSet &&
                facilityOrgUnitGroupSet &&
                !prevState.facilityOrgUnitGroupSet
            ) {
                setOrganisationUnitGroupSet(facilityOrgUnitGroupSet);
            }
        }

        if (validateLayer && validateLayer !== prevProps.validateLayer) {
            onLayerValidation(this.validate());
        }
    }

    render() {
        const {
            rows = [],
            radiusLow,
            organisationUnitColor,
            organisationUnitGroupSet,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setUserOrgUnits,
            toggleOrgUnit,
            setRadiusLow,
            setOrganisationUnitColor,
        } = this.props;

        const { tab, orgUnitsError } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const hasUserOrgUnits = !!selectedUserOrgUnits.length;

        return (
            <div data-test="facilitydialog">
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
                    <Tab value="style">{i18n.t('Style')}</Tab>
                </Tabs>
                <div className={styles.tabContent}>
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
                            className={styles.flexColumnFlow}
                            data-test="facilitydialog-styletab"
                        >
                            <div className={cx(styles.flexColumn)}>
                                <Labels />
                                <ColorPicker
                                    label={i18n.t('Color')}
                                    color={
                                        organisationUnitColor || ORG_UNIT_COLOR
                                    }
                                    onChange={setOrganisationUnitColor}
                                    className={styles.narrowField}
                                />
                                <NumberField
                                    label={i18n.t('Point radius')}
                                    value={
                                        radiusLow !== undefined
                                            ? radiusLow
                                            : ORG_UNIT_RADIUS
                                    }
                                    onChange={setRadiusLow}
                                    disabled={!!organisationUnitGroupSet}
                                    className={styles.narrowFieldIcon}
                                />
                                <BufferRadius defaultRadius={FACILITY_BUFFER} />
                            </div>
                            <div className={styles.flexColumn}>
                                <StyleByGroupSet
                                    defaultStyleType={STYLE_TYPE_SYMBOL}
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
        setRadiusLow,
        setOrganisationUnitGroupSet,
        setOrganisationUnitColor,
    },
    null,
    {
        forwardRef: true,
    }
)(FacilityDialog);
