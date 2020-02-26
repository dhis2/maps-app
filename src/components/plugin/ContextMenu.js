import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import './ContextMenu.css';

const ContextMenu = props => {
    const {
        position,
        offset,
        feature,
        onDrill,
        isSplitView,
        container,
    } = props;
    const menuEl = useRef();

    useEffect(() => {
        if (menuEl && position) {
            const { style } = menuEl.current;
            const [x, y] = position;

            if (!isSplitView) {
                style.left = `${x}px`;
                style.top = `${y}px`;
            } else {
                // TODO: Simplify!
                const [mapLeft, mapTop] = offset;
                const { left, top } = container.getBoundingClientRect();

                style.left = `${mapLeft - left + x}px`;
                style.top = `${mapTop - top + y}px`;
            }
        }
    }, [menuEl, position, isSplitView]);

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
    offset: PropTypes.array,
    onDrill: PropTypes.func.isRequired,
    isSplitView: PropTypes.bool,
    container: PropTypes.instanceOf(Element),
};

export default ContextMenu;
