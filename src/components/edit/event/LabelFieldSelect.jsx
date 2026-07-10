import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLabelDataItem } from '../../../actions/layerEdit.js'
import { useEventDataItems } from '../../dataItem/EventDataItemsProvider.jsx'
import Labels from '../shared/Labels.jsx'

const ITEM_NONE = { id: 'none', name: i18n.t('None') }

const LabelFieldSelect = () => {
    const labelDataItemId = useSelector(
        (state) => state.layerEdit.labelDataItem?.id
    )
    const dispatch = useDispatch()
    const { eventDataItems } = useEventDataItems()

    if (eventDataItems === null) {
        return null
    }

    const items = [ITEM_NONE, ...eventDataItems]

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
