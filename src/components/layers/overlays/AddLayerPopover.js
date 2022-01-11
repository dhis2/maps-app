import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover } from '@dhis2/ui';
import LayerList from './LayerList';
import { isSplitViewMap } from '../../../util/helpers';
import { loadLayer, editLayer } from '../../../actions/layers';
import { EXTERNAL_LAYER } from '../../../constants/layers';

const AddLayerPopover = ({
    anchorEl,
    layers = [],
    isSplitView,
    loadLayer,
    editLayer,
    onClose,
}) => {
    const onLayerSelect = layer => {
        const config = { ...layer };
        layer.layer === EXTERNAL_LAYER ? loadLayer(config) : editLayer(config);
        onClose();
    };

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
    );
};

AddLayerPopover.propTypes = {
    anchorEl: PropTypes.object,
    layers: PropTypes.array,
    isSplitView: PropTypes.bool,
    loadLayer: PropTypes.func.isRequired,
    editLayer: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default connect(
    ({ map, layers }) => ({
        layers,
        isSplitView: isSplitViewMap(map.mapViews),
    }),
    { loadLayer, editLayer }
)(AddLayerPopover);
