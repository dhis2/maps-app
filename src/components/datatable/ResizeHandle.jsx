import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import styles from './styles/ResizeHandle.module.css'

// Pointer events with pointer capture rather than HTML5 drag and drop:
// native DnD delays dragend until the OS "snap back" animation finishes,
// loses the resize cursor mid-drag and needs drag image workarounds.
const ResizeHandle = ({
    onResize,
    onResizeEnd,
    minHeight = 50,
    maxHeight = 500,
}) => {
    const dragHeight = useRef(null)
    const [isDragging, setIsDragging] = useState(false)

    const getHeight = (evt) =>
        Math.min(
            Math.max(window.innerHeight - evt.clientY, minHeight),
            maxHeight
        )

    const onPointerDown = (evt) => {
        if (evt.button !== 0) {
            return
        }
        evt.preventDefault() // Prevent text selection while dragging
        evt.currentTarget.setPointerCapture(evt.pointerId)
        dragHeight.current = null
        setIsDragging(true)
    }

    const onPointerMove = (evt) => {
        if (!isDragging) {
            return
        }
        const height = getHeight(evt)
        dragHeight.current = height
        onResize?.(height)
    }

    const onPointerUp = (evt) => {
        if (!isDragging) {
            return
        }
        if (evt.currentTarget.hasPointerCapture(evt.pointerId)) {
            evt.currentTarget.releasePointerCapture(evt.pointerId)
        }
        setIsDragging(false)
        // Skip plain clicks so they don't snap the panel to the cursor
        if (dragHeight.current !== null) {
            onResizeEnd?.(dragHeight.current)
        }
    }

    return (
        <div
            className={cx(styles.resizeHandle, {
                [styles.dragging]: isDragging,
            })}
            role="separator"
            aria-orientation="horizontal"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        />
    )
}

ResizeHandle.propTypes = {
    maxHeight: PropTypes.number.isRequired,
    minHeight: PropTypes.number,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
}

export default ResizeHandle
