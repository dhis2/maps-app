import { useDataQuery } from '@dhis2/app-runtime'
import { useState } from 'react'
import { toGeoJson } from '../util/map.js'

const GEO_FEATURES_QUERY = {
    features: {
        resource: 'geoFeatures',
        params: ({
            ou,
            includeGroupSets = false,
            displayProperty = 'NAME',
        }) => ({
            ou,
            includeGroupSets,
            displayProperty,
        }),
    },
}

const useGeoFeatures = () => {
    const [features, setFeatures] = useState()

    const { error, loading, refetch } = useDataQuery(GEO_FEATURES_QUERY, {
        lazy: true,
        onComplete: (data) => setFeatures(toGeoJson(data.features)),
    })

    return { features, getFeatures: refetch, loading, error }
}

export default useGeoFeatures
