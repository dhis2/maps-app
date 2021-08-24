import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import cx from 'classnames';
import { Tab, Tabs, Help } from '../core';
import OrgUnitGroupSetSelect from '../orgunits/OrgUnitGroupSetSelect';
import OrgUnitTree from '../orgunits/OrgUnitTree';
import OrgUnitGroupSelect from '../orgunits/OrgUnitGroupSelect';
import OrgUnitLevelSelect from '../orgunits/OrgUnitLevelSelect';
import UserOrgUnitsSelect from '../orgunits/UserOrgUnitsSelect';
import Labels from './shared/Labels';
import BufferRadius from './shared/BufferRadius';
import { FACILITY_BUFFER } from '../../constants/layers';
import styles from './styles/LayerDialog.module.css';

import {
    setOrganisationUnitGroupSet,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
    toggleOrgUnit,
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
        organisationUnitGroupSet: PropTypes.object,
        rows: PropTypes.array,
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
        };
    }

    componentDidUpdate(prev) {
        const { validateLayer, onLayerValidation } = this.props;

        if (validateLayer && validateLayer !== prev.validateLayer) {
            onLayerValidation(this.validate());
        }
    }

    render() {
        const {
            rows = [],
            organisationUnitGroupSet,
            setOrganisationUnitGroupSet,
            setOrgUnitLevels,
            setOrgUnitGroups,
            setUserOrgUnits,
            toggleOrgUnit,
        } = this.props;

        const { tab, orgUnitGroupSetError, orgUnitsError } = this.state;

        const orgUnits = getOrgUnitsFromRows(rows);
        const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
        const hasUserOrgUnits = !!selectedUserOrgUnits.length;

        return (
            <div data-test="facilitydialog">
                <Tabs value={tab} onChange={tab => this.setState({ tab })}>
                    <Tab value="group">{i18n.t('Group Set')}</Tab>
                    <Tab value="orgunits">{i18n.t('Organisation Units')}</Tab>
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
                            className={styles.flexColumnFlow}
                            data-test="facilitydialog-styletab"
                        >
                            <div className={cx(styles.flexColumn)}>
                                <Labels />
                                <BufferRadius defaultRadius={FACILITY_BUFFER} />
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
    },
    null,
    {
        forwardRef: true,
    }
)(FacilityDialog);
