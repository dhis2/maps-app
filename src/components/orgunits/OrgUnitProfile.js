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
            {profile && <OrgUnitInfo {...profile.info} />}
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
