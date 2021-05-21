import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import {
    Popover,
    Menu,
    MenuItem,
    Tooltip,
    IconArrowUp16,
    IconArrowDown16,
} from '@dhis2/ui';
import { ConditionalWrapper } from '../core';
import styles from './styles/ContextMenu.module.css';

const ContextMenu = props => {
    const {
        position,
        offset,
        feature,
        container,
        isSplitView,
        isOffline,
        onDrill,
        onClose,
    } = props;
    const anchorRef = useRef();
    const [anchorPosition, setAnchorPosition] = useState();

    useEffect(() => {
        if (position) {
            const [x, y] = position;

            if (!isSplitView) {
                setAnchorPosition({ left: x, top: y });
            } else {
                const [mapLeft, mapTop] = offset;
                const { left, top } = container.getBoundingClientRect();

                setAnchorPosition({
                    left: mapLeft - left + x,
                    top: mapTop - top + y,
                });
            }
        }
    }, [position, offset, container, isSplitView]);

    if (!position || !feature) {
        return null;
    }

    const { hasCoordinatesUp, hasCoordinatesDown } = feature.properties;

    return (
        <>
            <div
                ref={anchorRef}
                className={styles.anchor}
                style={anchorPosition}
            />
            <Popover
                reference={anchorRef}
                arrow={false}
                placement="right"
                onClickOutside={onClose}
            >
                <div className={styles.menu}>
                    <ConditionalWrapper
                        condition={isOffline}
                        wrapper={children => (
                            <Tooltip content={i18n.t('Not available offline')}>
                                {children}
                            </Tooltip>
                        )}
                    >
                        <Menu dense>
                            <MenuItem
                                label={i18n.t('Drill up one level')}
                                icon={<IconArrowUp16 />}
                                disabled={!hasCoordinatesUp || isOffline}
                                onClick={() => onDrill('up')}
                            />
                            <MenuItem
                                label={i18n.t('Drill down one level')}
                                icon={<IconArrowDown16 />}
                                disabled={!hasCoordinatesDown || isOffline}
                                onClick={() => onDrill('down')}
                            />
                        </Menu>
                    </ConditionalWrapper>
                </div>
            </Popover>
        </>
    );
};

ContextMenu.propTypes = {
    feature: PropTypes.object,
    position: PropTypes.array,
    offset: PropTypes.array,
    container: PropTypes.instanceOf(Element),
    isSplitView: PropTypes.bool,
    isOffline: PropTypes.bool,
    onDrill: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ContextMenu;
