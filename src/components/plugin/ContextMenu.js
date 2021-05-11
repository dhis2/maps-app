import React, { useRef } from 'react';
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
    const { position, offset, feature, isOnline, onDrill, onClose } = props;
    const anchorRef = useRef();

    if (!position || !feature) {
        return null;
    }

    const { hasCoordinatesUp, hasCoordinatesDown } = feature.properties;
    const isOffline = isOnline === false;
    const left = offset[0] + position[0];
    const top = offset[1] + position[1];

    return (
        <>
            <div
                ref={anchorRef}
                className={styles.anchor}
                style={{ left, top }}
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
    isOnline: PropTypes.bool,
    onDrill: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ContextMenu;
