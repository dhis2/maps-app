import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLabelDataItem } from '../../../actions/layerEdit.js'
import { useEventDataItems } from '../../../hooks/useEventDataItems.js'
import Labels from '../shared/Labels.jsx'

const ITEM_NONE = { id: 'none', name: i18n.t('None') }

const LabelFieldSelect = ({ program, programStage }) => {
    const labelDataItemId = useSelector(
        (state) => state.layerEdit.labelDataItem?.id
    )
    const dispatch = useDispatch()
    const { eventDataItems } = useEventDataItems({
        programId: program?.id,
        programStageId: programStage?.id,
    })

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

LabelFieldSelect.propTypes = {
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default LabelFieldSelect
