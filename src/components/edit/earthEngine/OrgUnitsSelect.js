import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import {
    toggleOrgUnit,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
} from '../../../actions/layerEdit.js'
import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitGroupsFromRows,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics.js'
import OrgUnitFieldSelect from '../../orgunits/OrgUnitFieldSelect.js'
import OrgUnitGroupSelect from '../../orgunits/OrgUnitGroupSelect.js'
import OrgUnitLevelSelect from '../../orgunits/OrgUnitLevelSelect.js'
import OrgUnitTree from '../../orgunits/OrgUnitTree.js'
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect.js'
import styles from '../styles/LayerDialog.module.css'

const OrgUnitsSelect = ({
    rows,
    error,
    toggleOrgUnit,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
}) => {
    const orgUnits = getOrgUnitsFromRows(rows)
    const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows)
    const hasUserOrgUnits = !!selectedUserOrgUnits.length

    return (
        <div className={styles.flexColumnFlow}>
            <div className={styles.orgUnitTree}>
                <OrgUnitTree
                    selected={getOrgUnitNodesFromRows(rows)}
                    onClick={toggleOrgUnit}
                    disabled={hasUserOrgUnits}
                />
            </div>
            <div className={styles.flexColumn}>
                <OrgUnitLevelSelect
                    orgUnitLevel={getOrgUnitLevelsFromRows(rows)}
                    onChange={setOrgUnitLevels}
                    disabled={hasUserOrgUnits}
                />
                <OrgUnitGroupSelect
                    orgUnitGroup={getOrgUnitGroupsFromRows(rows)}
                    onChange={setOrgUnitGroups}
                    disabled={hasUserOrgUnits}
                />
                <UserOrgUnitsSelect
                    selected={selectedUserOrgUnits}
                    onChange={setUserOrgUnits}
                />
                <OrgUnitFieldSelect />
                {!orgUnits.length && error && (
                    <div className={styles.error}>{error}</div>
                )}
            </div>
        </div>
    )
}

OrgUnitsSelect.propTypes = {
    setOrgUnitGroups: PropTypes.func.isRequired,
    setOrgUnitLevels: PropTypes.func.isRequired,
    setUserOrgUnits: PropTypes.func.isRequired,
    toggleOrgUnit: PropTypes.func.isRequired,
    error: PropTypes.string,
    rows: PropTypes.array,
}

export default connect(null, {
    toggleOrgUnit,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
})(OrgUnitsSelect)
