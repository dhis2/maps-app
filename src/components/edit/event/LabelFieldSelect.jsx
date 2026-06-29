import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLabelDataItem } from '../../../actions/layerEdit.js'
import { useEventDataItems } from '../../../hooks/useEventDataItems.js'
import { SelectField } from '../../core/index.js'
import Labels from '../shared/Labels.jsx'
import styles from '../styles/LayerDialog.module.css'

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
    const value = labelDataItemId ?? ITEM_NONE.id

    return (
        <>
            <SelectField
                label={i18n.t('Tooltip field')}
                value={value}
                items={items}
                onChange={(item) =>
                    dispatch(
                        setLabelDataItem(item.id !== ITEM_NONE.id ? item : null)
                    )
                }
                dataTest="label-field-select"
            />
            {labelDataItemId && <Labels className={styles.noMarginTop} />}
        </>
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
