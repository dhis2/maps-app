import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './Popup.css';

const container = document.createElement('div');

const Popup = (props, context) => {
    const { className = '', coordinates, onClose, children } = props;
    const { map } = context;

    useEffect(() => {
        container.className = className;
        map.openPopup(container, coordinates, onClose);
        return () => map.closePopup();
    });

    return createPortal(children, container);
};

Popup.contextTypes = {
    map: PropTypes.object,
};

Popup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default Popup;
