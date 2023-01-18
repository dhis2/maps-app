import { useDataQuery } from '@dhis2/app-runtime'
import { useState, useEffect } from 'react'
import { useUserSettings } from '../components/UserSettingsProvider.js'
import { getValidDataItems } from '../util/helpers.js'

const PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY = {
    trackedEntityAttributes: {
        resource: 'programs',
        id: ({ id }) => id,
        params: ({ nameProperty }) => {
            return {
                fields: [
                    `programTrackedEntityAttributes[trackedEntityAttribute[id,${nameProperty}~rename(name),valueType,optionSet[id,displayName~rename(name)],legendSet]]`,
                ],
                paging: false,
            }
        },
    },
}

export const useProgramTrackedEntityAttributes = ({ programId }) => {
    const [programAttributes, setProgramAttributes] = useState(null)
    const { nameProperty } = useUserSettings()

    const { refetch } = useDataQuery(PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY, {
        lazy: true,
        variables: { nameProperty },
        onComplete: (data) => {
            const attributes =
                data.trackedEntityAttributes.programTrackedEntityAttributes.map(
                    (attr) => attr.trackedEntityAttribute
                )

            setProgramAttributes(getValidDataItems(attributes))
        },
    })

    useEffect(() => {
        setProgramAttributes(null)

        if (programId) {
            refetch({
                id: programId,
            })
        }
    }, [programId, refetch])

    return {
        programAttributes,
    }
}
