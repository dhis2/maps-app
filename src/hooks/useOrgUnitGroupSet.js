import { useDataQuery } from '@dhis2/app-runtime'
import { useState } from 'react'

const ORG_UNIT_GROUP_SET_QUERY = {
    set: {
        resource: 'organisationUnitGroupSets',
        id: ({ id }) => id,
        params: {
            fields: 'organisationUnitGroups[id,name,color,symbol]',
        },
    },
}

const useGeoFeatures = () => {
    const [groupSet, setGroupSet] = useState()

    const { error, loading, refetch } = useDataQuery(ORG_UNIT_GROUP_SET_QUERY, {
        lazy: true,
        onComplete: (data) => setGroupSet(data),
    })

    return { groupSet, getGroupSet: refetch, loading, error }
}

export default useGeoFeatures
