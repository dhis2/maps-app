import { Component, Children } from 'react';
import PropTypes from 'prop-types';
import d2map from 'dhis2-gis-api/build';
import './MapProvider.css';

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
        // console.log('this.map', this.map.addControl);
    }

    render() {
        return Children.only(this.props.children);
    }
}

MapProvider.propTypes = {
    children: PropTypes.element.isRequired,
};

MapProvider.childContextTypes = {
    map: PropTypes.object.isRequired,
};

export default MapProvider;
