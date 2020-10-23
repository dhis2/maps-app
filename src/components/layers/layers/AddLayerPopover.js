import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover } from '@dhis2/ui';
import LayerList from './LayerList';
import { isSplitViewMap } from '../../../util/helpers';
import { addLayer, editLayer } from '../../../actions/layers';

const AddLayerPopover = ({
    anchorEl,
    layers = [],
    isSplitView,
    addLayer,
    editLayer,
    onClose,
}) => {
    const onLayerSelect = layer => {
        layer.layer === 'external'
            ? addLayer({ ...layer, isLoaded: true })
            : editLayer({ ...layer });

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
    addLayer: PropTypes.func.isRequired,
    editLayer: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default connect(
    ({ map, layers }) => ({
        layers,
        isSplitView: isSplitViewMap(map.mapViews),
    }),
    { addLayer, editLayer }
)(AddLayerPopover);
