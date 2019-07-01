import { Component } from 'react';
import PropTypes from 'prop-types';
import mapApi from './MapApi';

// Makes the Leaflet map instance available in all child components
class MapProvider extends Component {
    getChildContext() {
        return {
            map: this.map,
        };
    }

    constructor(props, context) {
        super(props, context);
        this.map = mapApi();
    }

    componentWillUnmount() {
        this.map.remove();
        delete this.map;
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
