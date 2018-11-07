import { Component } from 'react';
import PropTypes from 'prop-types';
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

        // Create Leaflet map
        this.map = d2map(div);
    }

    render() {
        return this.props.children;
    }
}

MapProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

MapProvider.childContextTypes = {
    map: PropTypes.object.isRequired,
};

export default MapProvider;
