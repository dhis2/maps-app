import i18n from '@dhis2/d2-i18n'
import { Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setStyleDataItem } from '../../actions/layerEdit.js'
import { useEventDataItems } from '../../hooks/useEventDataItems.js'
import { SelectField } from '../core/index.js'
import DataItemStyle from './DataItemStyle.js'

const excludeTypes = [
    'DATE',
    'FILE_RESOURCE',
    'ORGANISATION_UNIT',
    'COORDINATE',
]

// Style by data item is used by event layer, and can be reused for TEI layer in the future.
// Displays a select field with data items that support styling.
// Styling options are shown when a data item is selected.
const StyleByDataItem = ({ program, programStage, error }) => {
    const styleDataItem = useSelector((state) => state.layerEdit.styleDataItem)
    const dispatch = useDispatch()
    const { eventDataItems } = useEventDataItems({
        programId: program?.id,
        programStageId: programStage?.id,
        excludeTypes,
    })

    const ITEM_NONE = { id: 'none', name: i18n.t('None') }

    const onChange = (item) =>
        dispatch(setStyleDataItem(item.id !== ITEM_NONE.id ? item : null))

    if (eventDataItems === null) {
        return null
    }

    const dataItems = [ITEM_NONE, ...eventDataItems]

    if (
        styleDataItem &&
        !dataItems.find((item) => item.id === styleDataItem.id)
    ) {
        return (
            <Help error>
                {i18n.t('Selected value not available in in list: {{name}}', {
                    name: styleDataItem.name,
                    nsSeparator: '^^',
                })}
            </Help>
        )
    }

    return (
        <div>
            <SelectField
                label={i18n.t('Style by data item')}
                value={styleDataItem ? styleDataItem.id : null}
                items={dataItems}
                onChange={onChange}
                dataTest="style-by-data-item-select"
            />
            {styleDataItem && <DataItemStyle dataItem={styleDataItem} />}
            {error && <Help error>{error}</Help>}
        </div>
    )
}

StyleByDataItem.propTypes = {
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    program: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    programStage: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default StyleByDataItem
