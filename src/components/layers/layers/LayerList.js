import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Layer from './Layer';

const styles = {
    list: {
        padding: '16px 0 0 16px',
        overflowY: 'auto',
        maxWidth: 680,
        maxHeight: 'calc(100vh - 150px)',
    },
};

const LayerList = ({ classes, layers, onLayerSelect }) => (
    <div className={classes.list}>
        {layers.map((layer, index) => (
            <Layer
                key={`layer-${index}`}
                onClick={onLayerSelect}
                layer={layer}
            />
        ))}
    </div>
);

LayerList.propTypes = {
    classes: PropTypes.object.isRequired,
    layers: PropTypes.array.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
};

export default withStyles(styles)(LayerList);
