import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { IconCross24 } from '@dhis2/ui';
import Drawer from '../core/Drawer';
import OrgUnitInfo from './OrgUnitInfo';
import OrgUnitData from './OrgUnitData';
import { apiFetchTemp } from '../../util/api';
import { getFixedPeriodsByType, filterFuturePeriods } from '../../util/periods';
import { closeOrgUnit } from '../../actions/orgUnits';
import styles from './styles/OrgUnitProfile.module.css';

// TODO: Make configurable
const periodType = 'YEARLY';
const currentYear = String(new Date().getFullYear());
const periods = getFixedPeriodsByType(periodType, currentYear);
const defaultPeriod = filterFuturePeriods(periods)[0] || periods[0];

// https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/org-unit-profile.html
// https://www.sketch.com/s/bbd5189d-b84d-4ecb-9c54-9c34d3070c59/a/3OD01Dm#Inspector
const OrgUnitProfile = ({ id, closeOrgUnit }) => {
    const [profile, setProfile] = useState();

    useEffect(() => {
        if (id) {
            apiFetchTemp(
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
                {i18n.t('Location details')}
                <span className={styles.close} onClick={closeOrgUnit}>
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
    closeOrgUnit: PropTypes.func.isRequired,
};

export default connect(
    ({ orgUnit }) => ({
        id: orgUnit,
    }),
    { closeOrgUnit }
)(OrgUnitProfile);
