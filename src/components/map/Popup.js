import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './Popup.css';

const Popup = (props, context) => {
    const { className = '', coordinates, offset, onClose, children } = props;
    const { map } = context;
    const container = useMemo(() => document.createElement('div'), []);

    // Create and open popup on map
    useEffect(() => {
        container.className = className;
        map.openPopup(container, coordinates, onClose, offset);
    }, [map, container, className, coordinates, onClose]);

    // Close popup if component is unmounted
    useEffect(() => {
        return () => map.closePopup();
    }, []);

    return createPortal(children, container);
};

Popup.contextTypes = {
    map: PropTypes.object,
};

Popup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    offset: PropTypes.array,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default Popup;
