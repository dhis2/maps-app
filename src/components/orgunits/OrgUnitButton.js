import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Button } from '@dhis2/ui';
import { setOrgUnitProfile } from '../../actions/orgUnits';
import styles from './styles/OrgUnitButton.module.css';

/*
 *  Displays a button to open the org unit profile
 */
const OrgUnitButton = ({ id, orgUnitProfile, setOrgUnitProfile }) => (
    <div className={styles.orgUnitButton}>
        <Button
            small={true}
            disabled={id === orgUnitProfile}
            onClick={() => setOrgUnitProfile(id)}
        >
            {i18n.t('Show location details')}
        </Button>
    </div>
);

OrgUnitButton.propTypes = {
    id: PropTypes.string.isRequired,
    orgUnitProfile: PropTypes.string,
    setOrgUnitProfile: PropTypes.func.isRequired,
};

export default connect(
    ({ orgUnitProfile }) => ({
        orgUnitProfile,
    }),
    {
        setOrgUnitProfile,
    }
)(OrgUnitButton);
