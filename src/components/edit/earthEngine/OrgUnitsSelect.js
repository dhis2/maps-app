import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import OrgUnitTree from '../../orgunits/OrgUnitTree';
import OrgUnitLevelSelect from '../../orgunits/OrgUnitLevelSelect';
import OrgUnitGroupSelect from '../../orgunits/OrgUnitGroupSelect';
import UserOrgUnitsSelect from '../../orgunits/UserOrgUnitsSelect';
import OrgUnitGeometryAttributeSelect from '../../orgunits/OrgUnitGeometryAttributeSelect';
import {
    toggleOrgUnit,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
} from '../../../actions/layerEdit';
import {
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    getOrgUnitLevelsFromRows,
    getOrgUnitGroupsFromRows,
    getUserOrgUnitsFromRows,
} from '../../../util/analytics';
import styles from '../styles/LayerDialog.module.css';

const OrgUnitsSelect = ({
    rows,
    error,
    toggleOrgUnit,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
}) => {
    const orgUnits = getOrgUnitsFromRows(rows);
    const selectedUserOrgUnits = getUserOrgUnitsFromRows(rows);
    const hasUserOrgUnits = !!selectedUserOrgUnits.length;

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
                <OrgUnitGeometryAttributeSelect />
                {!orgUnits.length && error && (
                    <div className={styles.error}>{error}</div>
                )}
            </div>
        </div>
    );
};

OrgUnitsSelect.propTypes = {
    rows: PropTypes.array,
    error: PropTypes.string,
    toggleOrgUnit: PropTypes.func.isRequired,
    setOrgUnitLevels: PropTypes.func.isRequired,
    setOrgUnitGroups: PropTypes.func.isRequired,
    setUserOrgUnits: PropTypes.func.isRequired,
};

export default connect(null, {
    toggleOrgUnit,
    setOrgUnitLevels,
    setOrgUnitGroups,
    setUserOrgUnits,
})(OrgUnitsSelect);
