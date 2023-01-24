import { useDataQuery } from '@dhis2/app-runtime'

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

const useOptionSet = () => {
    const { data, error, refetch, loading } = useDataQuery(OPTION_SET_QUERY, {
        lazy: true,
    })

    return {
        optionSet: data?.optionSet,
        fetchOptionSet: refetch,
        error,
        loading,
    }
}

export default useOptionSet
