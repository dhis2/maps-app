import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import OrgUnitButton from '../orgunits/OrgUnitButton';
import './styles/Popup.css';

const Popup = (props, context) => {
    const { className = '', coordinates, orgUnitId, onClose, children } = props;
    const { map, isPlugin } = context;
    const container = useMemo(() => document.createElement('div'), []);

    // Create and open popup on map
    useEffect(() => {
        container.className = className;
        map.openPopup(container, coordinates, onClose);
    }, [map, container, className, coordinates, onClose]);

    // Close popup if component is unmounted
    useEffect(() => {
        return () => map.closePopup();
    }, []);

    return createPortal(
        <>
            {children}
            {isPlugin === false && orgUnitId && (
                <OrgUnitButton id={orgUnitId} />
            )}
        </>,
        container
    );
};

Popup.contextTypes = {
    map: PropTypes.object,
    isPlugin: PropTypes.bool,
};

Popup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default Popup;
