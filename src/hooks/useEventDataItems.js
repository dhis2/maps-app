import { useMemo } from 'react'
import { combineDataItems } from '../util/analytics.js'
import { useProgramStageDataElements } from './useProgramStageDataElements.js'
import { useProgramTrackedEntityAttributes } from './useProgramTrackedEntityAttributes.js'

export const useEventDataItems = ({
    programId,
    programStageId,
    includeTypes,
    excludeTypes,
}) => {
    const { dataElements, loading: dataElementsLoading } =
        useProgramStageDataElements({ programStageId })
    const { programAttributes, loading: attributesLoading } =
        useProgramTrackedEntityAttributes({
            programId,
        })

    const eventDataItems = useMemo(() => {
        if (dataElements !== null && programAttributes !== null) {
            return combineDataItems(
                programAttributes,
                dataElements,
                includeTypes || null,
                excludeTypes || null
            )
        }
        return null
    }, [dataElements, programAttributes, includeTypes, excludeTypes])

    return {
        eventDataItems,
        loading: dataElementsLoading || attributesLoading,
    }
}
