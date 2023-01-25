import { useDataQuery } from '@dhis2/app-runtime'
import { useState, useEffect } from 'react'

const OPTION_SET_QUERY = {
    optionSet: {
        resource: 'optionSets',
        id: ({ id }) => id,
        params: {
            fields: [
                'id',
                'displayName~rename(name)',
                'options[id,code,displayName~rename(name),style[color]]',
            ],
            paging: false,
        },
    },
}

const useOptionSet = (optionSetId) => {
    const [optionSet, setOptionSet] = useState(null)

    const { refetch, loading } = useDataQuery(OPTION_SET_QUERY, {
        lazy: true,
        onComplete: (data) => {
            setOptionSet(data.optionSet)
        },
    })

    useEffect(() => {
        setOptionSet(null)

        if (optionSetId) {
            refetch({
                id: optionSetId,
            })
        }
    }, [optionSetId, refetch])

    return { optionSet, loading }
}

export default useOptionSet
