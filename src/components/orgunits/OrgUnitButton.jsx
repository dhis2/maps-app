import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import styles from './styles/OrgUnitButton.module.css'

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
            {i18n.t('View profile')}
        </Button>
    </div>
)

OrgUnitButton.propTypes = {
    id: PropTypes.string.isRequired,
    setOrgUnitProfile: PropTypes.func.isRequired,
    orgUnitProfile: PropTypes.string,
}

export default connect(
    ({ orgUnitProfile }) => ({
        orgUnitProfile,
    }),
    {
        setOrgUnitProfile,
    }
)(OrgUnitButton)
