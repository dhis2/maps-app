import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import { useState, useEffect } from 'react'
import { getValidDataItems } from '../util/helpers.js'

const PROGRAM_STAGE_DATA_ELEMENTS_QUERY = {
    elements: {
        resource: 'programStages',
        id: ({ id }) => id,
        params: ({ nameProperty }) => {
            return {
                fields: [
                    `programStageDataElements[dataElement[id,${nameProperty}~rename(name),valueType,optionSet[id,displayName~rename(name)],legendSet]]`,
                ],
                paging: false,
            }
        },
    },
}
export const useProgramStageDataElements = ({ programStageId }) => {
    const [dataElements, setDataElements] = useState(null)
    const { nameProperty } = useCachedDataQuery()

    const { refetch, loading } = useDataQuery(
        PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
        {
            lazy: true,
            variables: { nameProperty },
            onComplete: (data) => {
                const elements = data?.elements?.programStageDataElements?.map(
                    (attr) => attr.dataElement
                )

                setDataElements(getValidDataItems(elements))
            },
        }
    )

    useEffect(() => {
        setDataElements(null)

        if (programStageId) {
            refetch({
                id: programStageId,
            })
        }
    }, [programStageId, refetch])

    return {
        dataElements,
        loading,
    }
}
