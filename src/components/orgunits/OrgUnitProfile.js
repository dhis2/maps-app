import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { IconCross24 } from '@dhis2/ui';
import Drawer from '../core/Drawer';
import OrgUnitInfo from './OrgUnitInfo';
import OrgUnitData from './OrgUnitData';
import { apiFetch } from '../../util/api';
import { getFixedPeriodsByType, filterFuturePeriods } from '../../util/periods';
import { closeOrgUnitProfile } from '../../actions/orgUnits';
import styles from './styles/OrgUnitProfile.module.css';

// Only YEARLY period type is supported in first version
const periodType = 'YEARLY';
const currentYear = String(new Date().getFullYear());
const periods = getFixedPeriodsByType(periodType, currentYear);
const defaultPeriod = filterFuturePeriods(periods)[0] || periods[0];

/*
 *  Loads an org unit profile and displays it in a right drawer component
 */
export const OrgUnitProfile = ({ id, closeOrgUnitProfile }) => {
    const [profile, setProfile] = useState();

    // Load org unit profile when id is changed
    // https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/org-unit-profile.html
    useEffect(() => {
        if (id) {
            apiFetch(
                `/organisationUnitProfile/${id}/data?period=${defaultPeriod.id}`
            ).then(setProfile);
        }
    }, [id]);

    if (!id) {
        return null;
    }

    return (
        <Drawer className={styles.drawer}>
            <div className={styles.header}>
                {i18n.t('Organisation unit profile')}
                <span className={styles.close} onClick={closeOrgUnitProfile}>
                    <IconCross24 />
                </span>
            </div>
            <div className={styles.content}>
                {profile && (
                    <>
                        <OrgUnitInfo
                            {...profile.info}
                            groupSets={profile.groupSets}
                            attributes={profile.attributes}
                        />
                        <OrgUnitData
                            id={id}
                            periodType={periodType}
                            defaultPeriod={defaultPeriod}
                            data={profile.dataItems}
                        />
                    </>
                )}
            </div>
        </Drawer>
    );
};

OrgUnitProfile.propTypes = {
    id: PropTypes.string,
    closeOrgUnitProfile: PropTypes.func.isRequired,
};

export default connect(
    ({ orgUnitProfile }) => ({
        id: orgUnitProfile,
    }),
    { closeOrgUnitProfile }
)(OrgUnitProfile);
