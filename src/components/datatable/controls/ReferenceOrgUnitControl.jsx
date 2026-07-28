import i18n from '@dhis2/d2-i18n'
import { IconLocation16 } from '@dhis2/ui'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editLayer } from '../../../actions/layers.js'
import { COMBINED_TABLE_REF_LAYER } from '../../../constants/layers.js'
import ToolbarIconButton from './ToolbarIconButton.jsx'

// Shared by ReferenceOrgUnitControl (the toolbar button) and BottomPanel.jsx
// (which also needs to open the same dialog when "Combined" is selected
// before a reference has been configured yet) - both open the reference
// layer for editing via the same editLayer/LayerEdit.jsx flow every other
// layer uses, creating it first (as a draft, no id yet) if it doesn't
// already exist in mapViews. See CLAUDE.md/map-layer-architecture:
// LayerEdit.jsx routes to addLayer or updateLayer on save based on whether
// the object passed here has an id, so neither caller dispatches either
// directly.
export const useReferenceLayer = () => {
    const dispatch = useDispatch()
    const referenceLayer = useSelector((state) =>
        state.map.mapViews.find((l) => l.layer === COMBINED_TABLE_REF_LAYER)
    )

    const openReferenceLayerEditor = () =>
        dispatch(
            editLayer(
                referenceLayer ?? {
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
            <IconLocation16 />
        </ToolbarIconButton>
    )
}

export default ReferenceOrgUnitControl
