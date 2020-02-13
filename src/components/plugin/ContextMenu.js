import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import './ContextMenu.css';

const ContextMenu = props => {
    const { position, feature, onDrill } = props;
    const menuEl = useRef();

    useEffect(() => {
        if (menuEl && position) {
            const { style } = menuEl.current;
            const [x, y] = position;

            style.left = `${x}px`;
            style.top = `${y}px`;
        }
    }, [menuEl, position]);

    if (!position || !feature) {
        return null;
    }

    const { hasCoordinatesUp, hasCoordinatesDown } = feature.properties;

    return (
        <div className="dhis2-map-context-menu" ref={menuEl}>
            {hasCoordinatesUp && (
                <div onClick={() => onDrill('up')}>
                    {i18n.t('Drill up one level')}
                </div>
            )}
            {hasCoordinatesDown && (
                <div onClick={() => onDrill('down')}>
                    {i18n.t('Drill down one level')}
                </div>
            )}
        </div>
    );
};

ContextMenu.propTypes = {
    feature: PropTypes.object,
    position: PropTypes.array,
    onDrill: PropTypes.func.isRequired,
};

export default ContextMenu;
