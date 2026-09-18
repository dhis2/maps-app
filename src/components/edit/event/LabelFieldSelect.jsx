import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLabelDataItem } from '../../../actions/layerEdit.js'
import { EVENT_COORDINATE_GEOMETRY_SOURCE } from '../../../constants/layers.js'
import { serverSupportsGeometrySource } from '../../../util/versionToggle.js'
import { useEventDataItems } from '../../dataItem/EventDataItemsProvider.jsx'
import Labels from '../shared/Labels.jsx'

const ITEM_NONE = { id: 'none', name: i18n.t('None') }

const GEOMETRY_SOURCE_ITEM = {
    id: EVENT_COORDINATE_GEOMETRY_SOURCE,
    name: i18n.t('Geometry source'),
}

const LabelFieldSelect = () => {
    const { serverVersion } = useConfig()
    const labelDataItemId = useSelector(
        (state) => state.layerEdit.labelDataItem?.id
    )
    const dispatch = useDispatch()
    const { eventDataItems } = useEventDataItems()

    if (eventDataItems === null) {
        return null
    }

    // VERSION-TOGGLE: geometrySource only exists on 2.44+ - see util/versionToggle.js.
    const items = [
        ITEM_NONE,
        ...(serverSupportsGeometrySource(serverVersion)
            ? [GEOMETRY_SOURCE_ITEM]
            : []),
        ...eventDataItems,
    ]

    return (
        <Labels
            dataItems={items}
            dataItemValue={labelDataItemId ?? ITEM_NONE.id}
            onDataItemChange={(item) =>
                dispatch(
                    setLabelDataItem(item.id === ITEM_NONE.id ? null : item)
                )
            }
        />
    )
}

export default LabelFieldSelect
