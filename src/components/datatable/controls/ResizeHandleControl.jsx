import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import { IconDrag } from '../../core/icons.jsx'
import styles from './styles/ResizeHandleControl.module.css'

// A plain click still fires pointerdown/pointerup with (near-)identical
// clientY - only treat it as a resize once the pointer clearly moved
const DRAG_THRESHOLD_PX = 3

const ResizeHandleControl = ({
    onResize,
    onResizeStart,
    onResizeEnd,
    minHeight = 50,
    maxHeight = 500,
}) => {
    const isDraggingRef = useRef(false)
    const hasMovedRef = useRef(false)
    const startYRef = useRef(0)

    const getHeight = (clientY) => {
        const height = window.innerHeight - clientY
        return Math.min(Math.max(height, minHeight), maxHeight)
    }

    const onPointerDown = (evt) => {
        evt.preventDefault() // avoid text selection while dragging
        evt.currentTarget.setPointerCapture(evt.pointerId)
        isDraggingRef.current = true
        hasMovedRef.current = false
        startYRef.current = evt.clientY
    }

    const onPointerMove = (evt) => {
        if (!isDraggingRef.current) {
            return
        }
        if (!hasMovedRef.current) {
            if (Math.abs(evt.clientY - startYRef.current) < DRAG_THRESHOLD_PX) {
                return
            }
            hasMovedRef.current = true
            onResizeStart?.()
            evt.currentTarget.style.cursor = 'grabbing'
            document.body.style.cursor = 'grabbing'
        }
        onResize?.(getHeight(evt.clientY))
    }

    const onPointerUp = (evt) => {
        if (!isDraggingRef.current) {
            return
        }
        isDraggingRef.current = false
        evt.currentTarget.releasePointerCapture(evt.pointerId)
        if (!hasMovedRef.current) {
            return
        }
        evt.currentTarget.style.removeProperty('cursor')
        document.body.style.removeProperty('cursor')
        onResizeEnd?.(getHeight(evt.clientY))
    }

    // In case the handle/panel unmounts mid-drag
    useEffect(
        () => () => {
            if (isDraggingRef.current) {
                document.body.style.removeProperty('cursor')
            }
        },
        []
    )

    return (
        <div
            className={styles.resizeHandle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            <span className={styles.gripBox}>
                <IconDrag />
            </span>
        </div>
    )
}

ResizeHandleControl.propTypes = {
    maxHeight: PropTypes.number.isRequired,
    minHeight: PropTypes.number,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onResizeStart: PropTypes.func,
}

export default ResizeHandleControl
