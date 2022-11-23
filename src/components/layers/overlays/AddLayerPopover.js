import { Popover } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { loadLayer, editLayer } from '../../../actions/layers.js'
import { EXTERNAL_LAYER } from '../../../constants/layers.js'
import { isSplitViewMap } from '../../../util/helpers.js'
import LayerList from './LayerList.js'

const AddLayerPopover = ({
    anchorEl,
    layers = [],
    isSplitView,
    loadLayer,
    editLayer,
    onClose,
}) => {
    const onLayerSelect = (layer) => {
        const config = { ...layer }
        layer.layer === EXTERNAL_LAYER ? loadLayer(config) : editLayer(config)
        onClose()
    }

    return (
        <Popover
            arrow={false}
            reference={anchorEl}
            placement="bottom-start"
            maxWidth={700}
            onClickOutside={onClose}
            dataTest="addlayerpopover"
        >
            <LayerList
                layers={layers}
                isSplitView={isSplitView}
                onLayerSelect={onLayerSelect}
            />
        </Popover>
    )
}

AddLayerPopover.propTypes = {
    editLayer: PropTypes.func.isRequired,
    loadLayer: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
    isSplitView: PropTypes.bool,
    layers: PropTypes.array,
}

export default connect(
    ({ map, layers }) => ({
        layers,
        isSplitView: isSplitViewMap(map.mapViews),
    }),
    { loadLayer, editLayer }
)(AddLayerPopover)
