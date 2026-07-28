import i18n from '@dhis2/d2-i18n'
import { IconLocation16 } from '@dhis2/ui'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editLayer } from '../../../actions/layers.js'
import { COMBINED_TABLE_REF_LAYER } from '../../../constants/layers.js'
import ToolbarIconButton from './ToolbarIconButton.jsx'

// Opens the Combined data table's reference org unit layer for editing via
// the same editLayer/LayerEdit.jsx flow every other layer uses - creating
// it first (as a draft, no id yet) if it doesn't already exist in
// mapViews. See CLAUDE.md/map-layer-architecture: LayerEdit.jsx routes to
// addLayer or updateLayer on save based on whether the object passed here
// has an id, so this component itself never dispatches either directly.
const ReferenceOrgUnitControl = () => {
    const dispatch = useDispatch()
    const referenceLayer = useSelector((state) =>
        state.map.mapViews.find((l) => l.layer === COMBINED_TABLE_REF_LAYER)
    )

    const onClick = () =>
        dispatch(
            editLayer(
                referenceLayer ?? {
                    layer: COMBINED_TABLE_REF_LAYER,
                    isVisible: false,
                    rows: [],
                }
            )
        )

    return (
        <ToolbarIconButton
            tooltip={i18n.t('Configure reference org units')}
            ariaLabel={i18n.t('Configure reference org units')}
            dataTest="data-table-reference-org-unit-button"
            onClick={onClick}
        >
            <IconLocation16 />
        </ToolbarIconButton>
    )
}

export default ReferenceOrgUnitControl
