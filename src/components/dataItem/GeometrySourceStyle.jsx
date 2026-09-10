import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setGeometrySourceStyle } from '../../actions/layerEdit.js'
import { qualitativeColors } from '../../constants/colors.js'
import {
    COORDINATE_FIELD_NAMES,
    EVENT_COORDINATE_CASCADING,
    EVENT_COORDINATE_DEFAULT,
    EVENT_COORDINATE_ENROLLMENT,
    EVENT_COORDINATE_ORG_UNIT,
    EVENT_COORDINATE_TRACKED_ENTITY,
    NONE,
} from '../../constants/layers.js'
import OptionStyle from '../optionSet/OptionStyle.jsx'
import { useEventDataItems } from './EventDataItemsProvider.jsx'

const style = {
    marginTop: 20,
}

// Expands a coordinate field id to the set of geometrySource values the backend can return.
// For 'cascading', this is the full cascade chain based on whether the program has a TEI type.
const expandField = (fieldId, hasTei) => {
    if (fieldId === EVENT_COORDINATE_CASCADING) {
        return hasTei
            ? [
                  EVENT_COORDINATE_ENROLLMENT,
                  EVENT_COORDINATE_DEFAULT,
                  EVENT_COORDINATE_TRACKED_ENTITY,
                  EVENT_COORDINATE_ORG_UNIT,
              ]
            : [EVENT_COORDINATE_DEFAULT, EVENT_COORDINATE_ORG_UNIT]
    }
    return [fieldId]
}

const getPossibleSources = (
    eventCoordinateField,
    fallbackCoordinateField,
    hasTei
) => {
    const main = expandField(
        eventCoordinateField ?? EVENT_COORDINATE_DEFAULT,
        hasTei
    )
    const fallback =
        fallbackCoordinateField && fallbackCoordinateField !== NONE
            ? expandField(fallbackCoordinateField, hasTei)
            : []
    return [...new Set([...main, ...fallback])]
}

const GeometrySourceStyle = () => {
    const dispatch = useDispatch()
    const styleDataItem = useSelector((state) => state.layerEdit.styleDataItem)
    const eventCoordinateField = useSelector(
        (state) => state.layerEdit.eventCoordinateField
    )
    const fallbackCoordinateField = useSelector(
        (state) => state.layerEdit.fallbackCoordinateField
    )
    const { eventDataItems, trackedEntityType } = useEventDataItems({
        includeTypes: ['COORDINATE', 'ORGANISATION_UNIT'],
    })

    const hasTei = !!trackedEntityType?.id

    const sources = getPossibleSources(
        eventCoordinateField,
        fallbackCoordinateField,
        hasTei
    )

    const values = styleDataItem?.values

    useEffect(() => {
        if (eventDataItems === null) {
            return
        }
        const usedColors = new Set(Object.values(values || {}))
        const availableColors = qualitativeColors.filter(
            (c) => !usedColors.has(c)
        )
        let nextColorIndex = 0
        sources.forEach((sourceId) => {
            if (!values?.[sourceId]) {
                const color =
                    availableColors[nextColorIndex] ??
                    qualitativeColors[nextColorIndex % qualitativeColors.length]
                nextColorIndex++
                dispatch(setGeometrySourceStyle(sourceId, color))
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sources.join(','), eventDataItems === null, dispatch])

    // Wait for event data items to load before rendering, so DE/TEA UIDs
    // are never shown raw (trackedEntityType also drives sources via hasTei)
    if (eventDataItems === null || !values) {
        return null
    }

    const resolveLabel = (sourceId) => {
        if (COORDINATE_FIELD_NAMES[sourceId]) {
            return COORDINATE_FIELD_NAMES[sourceId]
        }
        const item = eventDataItems?.find((i) => i.id === sourceId)
        return item?.name ?? sourceId
    }

    return (
        <div style={style}>
            {sources.map((sourceId) => (
                <OptionStyle
                    key={sourceId}
                    name={resolveLabel(sourceId)}
                    color={values[sourceId]}
                    onChange={(color) =>
                        dispatch(setGeometrySourceStyle(sourceId, color))
                    }
                />
            ))}
        </div>
    )
}

export default GeometrySourceStyle
