import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import d2map from '@dhis2/gis-api';

// Makes the Leaflet map instance available in all child components
class MapProvider extends Component {
    getChildContext() {
        return {
            map: this.map,
        };
    }

    constructor(props, context) {
        super(props, context);

        // Create map div
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';

        this.map = d2map(div);
    }

    render() {
        const { isDownload, children } = this.props;

        // Adds CSS class if in download mode (used to hide map controls)
        return (
            <div className={isDownload ? 'dhis2-maps-download' : null}>
                {children}
            </div>
        );
    }
}

MapProvider.propTypes = {
    isDownload: PropTypes.bool.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

MapProvider.childContextTypes = {
    map: PropTypes.object.isRequired,
};

export default connect(state => ({
    isDownload: state.download.isActive,
}))(MapProvider);
