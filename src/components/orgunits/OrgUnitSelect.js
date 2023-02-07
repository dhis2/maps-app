import { OrgUnitDimension } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import React, { useState } from 'react'
import styles from './styles/OrgUnitSelect.module.css'

// Fetches the root org units associated with the current user with fallback to data capture org units
const ORG_UNIT_TREE_QUERY = {
    tree: {
        resource: 'organisationUnits',
        params: () => ({
            fields: ['id'],
            userDataViewFallback: true,
        }),
    },
}

const OrgUnitSelect = () => {
    const [orgUnits, setOrgUnits] = useState([])
    const { loading, error, data } = useDataQuery(ORG_UNIT_TREE_QUERY)

    const roots = data?.tree.organisationUnits.map(
        (rootOrgUnit) => rootOrgUnit.id
    )

    if (!roots) {
        return null // TODO: Loading indicator
    }

    console.log(orgUnits)

    return (
        <div className={styles.orgUnitSelect}>
            <OrgUnitDimension
                roots={roots}
                selected={orgUnits}
                onSelect={(dimension) => setOrgUnits(dimension.items)}
            />
        </div>
    )
}

export default OrgUnitSelect
