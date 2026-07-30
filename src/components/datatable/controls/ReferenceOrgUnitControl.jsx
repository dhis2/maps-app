import i18n from '@dhis2/d2-i18n'
import { IconDimensionOrgUnit16 } from '@dhis2/ui'
import React from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { editLayer } from '../../../actions/layers.js'
import { COMBINED_TABLE_REF_LAYER } from '../../../constants/layers.js'
import ToolbarIconButton from './ToolbarIconButton.jsx'

const findReferenceLayer = (mapViews) =>
    mapViews.find((l) => l.layer === COMBINED_TABLE_REF_LAYER)

export const useReferenceLayer = () => {
    const dispatch = useDispatch()
    const store = useStore()
    const referenceLayer = useSelector((state) =>
        findReferenceLayer(state.map.mapViews)
    )

    const openReferenceLayerEditor = () =>
        dispatch(
            editLayer(
                findReferenceLayer(store.getState().map.mapViews) ?? {
                    layer: COMBINED_TABLE_REF_LAYER,
                    isVisible: false,
                    rows: [],
                }
            )
        )

    return { referenceLayer, openReferenceLayerEditor }
}

const ReferenceOrgUnitControl = () => {
    const { openReferenceLayerEditor } = useReferenceLayer()

    return (
        <ToolbarIconButton
            tooltip={i18n.t('Configure reference org units')}
            ariaLabel={i18n.t('Configure reference org units')}
            dataTest="data-table-reference-org-unit-button"
            onClick={openReferenceLayerEditor}
        >
            <IconDimensionOrgUnit16 />
        </ToolbarIconButton>
    )
}

export default ReferenceOrgUnitControl
