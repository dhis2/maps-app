import React from 'react';
import PropTypes from 'prop-types';
import FeatureService from './FeatureService';

const layerType = {
    featureService: FeatureService,
};

const ExternalDialog = props => {
    const { type } = props.config;

    const LayerDialog = layerType[type];

    if (!LayerDialog) {
        return null;
    }

    return <LayerDialog {...props} />;
};

ExternalDialog.propTypes = {
    config: PropTypes.shape({
        type: PropTypes.string.isRequired,
    }),
};

export default ExternalDialog;
