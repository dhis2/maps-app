import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { IconCross24 } from '@dhis2/ui';
import Drawer from '../core/Drawer';
import OrgUnitInfo from './OrgUnitInfo';
import { apiFetchTemp } from '../../util/api';
import { closeOrgUnit } from '../../actions/orgUnits';
import styles from './styles/OrgUnitProfile.module.css';

// https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/organisationunit-profile.html
// https://www.sketch.com/s/bbd5189d-b84d-4ecb-9c54-9c34d3070c59/a/3OD01Dm#Inspector
const OrgUnitProfile = ({ id, closeOrgUnit }) => {
    const [profile, setProfile] = useState();

    useEffect(() => {
        if (id) {
            // apiFetchTemp(`/orgUnitProfile`).then(console.log); // fmLRqcL9sWF
            apiFetchTemp(`/orgUnitProfile/data/${id}`).then(setProfile); // fmLRqcL9sWF
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
                {profile && <OrgUnitInfo {...profile.info} />}
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
