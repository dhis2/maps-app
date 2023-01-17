import { useDataQuery } from '@dhis2/app-runtime'
import { useState, useEffect } from 'react'
import { getValidDataItems } from '../util/helpers.js'
import { useUserSettings } from './UserSettingsProvider.js'

const PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY = {
    trackedEntityAttributes: {
        resource: 'programs',
        id: ({ id }) => id,
        params: ({ nameProperty }) => {
            return {
                fields: [
                    `programTrackedEntityAttributes[trackedEntityAttribute[id,${nameProperty}~rename(name),valueType]]`,
                ],
                paging: false,
            }
        },
    },
}

export const useProgramTrackedEntityAttributes = () => {
    const [programAttributes, setProgramAttributes] = useState({})
    const [programId, setProgramId] = useState(null)
    const { nameProperty } = useUserSettings()

    const { refetch } = useDataQuery(PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY, {
        lazy: true,
        variables: { nameProperty },
        onComplete: (data) => {
            const attributes =
                data.trackedEntityAttributes.programTrackedEntityAttributes.map(
                    (attr) => attr.trackedEntityAttribute
                )

            setProgramAttributes({
                ...programAttributes,
                [programId]: getValidDataItems(attributes),
            })
        },
    })

    useEffect(() => {
        if (programId && !programAttributes[programId]) {
            refetch({
                id: programId,
            })
        }
    }, [programId, programAttributes, refetch])

    return { programAttributes, setProgramIdForProgramAttributes: setProgramId }
}
