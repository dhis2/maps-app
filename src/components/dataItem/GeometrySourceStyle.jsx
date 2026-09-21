import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setGeometrySourceStyle } from '../../actions/layerEdit.js'
import { COORDINATE_FIELD_NAMES } from '../../constants/layers.js'
import {
    getDefaultGeometrySourceColor,
    getPossibleGeometrySources,
} from '../../util/coordinatesName.js'
import OptionStyle from '../optionSet/OptionStyle.jsx'
import { useEventDataItems } from './EventDataItemsProvider.jsx'

const style = {
    marginTop: 20,
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

    const sources = getPossibleGeometrySources(
        eventCoordinateField,
        fallbackCoordinateField,
        hasTei
    )

    const values = styleDataItem?.values

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
                    color={
                        values[sourceId] ??
                        getDefaultGeometrySourceColor(sourceId, {
                            eventCoordinateField,
                            fallbackCoordinateField,
                        })
                    }
                    onChange={(color) =>
                        dispatch(setGeometrySourceStyle(sourceId, color))
                    }
                />
            ))}
        </div>
    )
}

export default GeometrySourceStyle
