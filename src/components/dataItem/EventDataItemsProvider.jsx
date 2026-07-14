import PropTypes from 'prop-types'
import React, { createContext, useContext, useMemo } from 'react'
import { useProgramStageDataElements } from '../../hooks/useProgramStageDataElements.js'
import { useProgramTrackedEntityAttributes } from '../../hooks/useProgramTrackedEntityAttributes.js'
import { combineDataItems } from '../../util/analytics.js'

const EventDataItemsCtx = createContext(null)

// Fetches program stage data elements and program tracked entity attributes
// once, and shares them with every useEventDataItems() call within — avoids
// duplicate network requests when several components need the same
// program/programStage's data items, each with their own type filter.
const EventDataItemsProvider = ({ programId, programStageId, children }) => {
    const { dataElements, loading: dataElementsLoading } =
        useProgramStageDataElements({ programStageId })
    const {
        programAttributes,
        trackedEntityType,
        loading: attributesLoading,
    } = useProgramTrackedEntityAttributes({ programId })

    const value = useMemo(
        () => ({
            dataElements,
            programAttributes,
            trackedEntityType,
            loading: dataElementsLoading || attributesLoading,
        }),
        [
            dataElements,
            programAttributes,
            trackedEntityType,
            dataElementsLoading,
            attributesLoading,
        ]
    )

    return (
        <EventDataItemsCtx.Provider value={value}>
            {children}
        </EventDataItemsCtx.Provider>
    )
}

EventDataItemsProvider.propTypes = {
    children: PropTypes.node,
    programId: PropTypes.string,
    programStageId: PropTypes.string,
}

export default EventDataItemsProvider

export const useEventDataItems = ({ includeTypes, excludeTypes } = {}) => {
    const context = useContext(EventDataItemsCtx)

    if (!context) {
        throw new Error(
            'useEventDataItems must be used within an EventDataItemsProvider'
        )
    }

    const { dataElements, programAttributes, trackedEntityType, loading } =
        context

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
        trackedEntityType,
        loading,
    }
}
