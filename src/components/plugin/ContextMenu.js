import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Popover,
    Menu,
    MenuItem,
    Tooltip,
    IconArrowUp16,
    IconArrowDown16,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState, useEffect } from 'react'
import { ConditionalWrapper } from '../core/index.js'
import styles from './styles/ContextMenu.module.css'

const ContextMenu = (props) => {
    const {
        position,
        offset,
        feature,
        container,
        isSplitView,
        onDrill,
        onClose,
    } = props
    const { isDisconnected: isOffline } = useDhis2ConnectionStatus()
    const anchorRef = useRef()
    const [anchorPosition, setAnchorPosition] = useState()

    useEffect(() => {
        if (position) {
            const [x, y] = position

            if (!isSplitView) {
                setAnchorPosition({ left: x, top: y })
            } else {
                const [mapLeft, mapTop] = offset
                const { left, top } = container.getBoundingClientRect()

                setAnchorPosition({
                    left: mapLeft - left + x,
                    top: mapTop - top + y,
                })
            }
        }
    }, [position, offset, container, isSplitView])

    const { hasCoordinatesUp, hasCoordinatesDown } = feature.properties

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
                        wrapper={(children) => (
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
    )
}

ContextMenu.propTypes = {
    onClose: PropTypes.func.isRequired,
    onDrill: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element),
    feature: PropTypes.object,
    isSplitView: PropTypes.bool,
    offset: PropTypes.array,
    position: PropTypes.array,
}

export default ContextMenu
