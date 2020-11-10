import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';

const styles = {
    root: {
        position: 'relative',
    },
    list: {
        maxWidth: 696,
        maxHeight: 'calc(100vh - 150px)',
        padding: '16px 0 0 16px',
        overflowY: 'auto',
    },
    split: {
        width: 360,
        padding: '40px 50px',
        lineHeight: '25px',
        fontStyle: 'italic',
    },
};

const LayerList = ({ classes, layers, isSplitView, onLayerSelect }) => (
    <div className={classes.root}>
        {isSplitView ? (
            <div className={classes.split}>
                {i18n.t(
                    'Split view can not be combined with other layer types.'
                )}
            </div>
        ) : (
            <div className={classes.list} data-test="addlayerlist">
                {layers.map((layer, index) => (
                    <Layer
                        key={`layer-${index}`}
                        onClick={onLayerSelect}
                        layer={layer}
                    />
                ))}
            </div>
        )}
    </div>
);

LayerList.propTypes = {
    classes: PropTypes.object.isRequired,
    layers: PropTypes.array.isRequired,
    isSplitView: PropTypes.bool,
    onLayerSelect: PropTypes.func.isRequired,
};

export default withStyles(styles)(LayerList);
