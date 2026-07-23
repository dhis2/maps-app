import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import { IconDrag } from '../../core/icons.jsx'
import styles from './styles/ResizeHandleControl.module.css'

const ResizeHandleControl = ({
    onResize,
    onResizeStart,
    onResizeEnd,
    onResizeCancel,
    minHeight = 50,
    maxHeight = 500,
}) => {
    const isDraggingRef = useRef(false)

    const getHeight = (clientY) => {
        const height = window.innerHeight - clientY
        return Math.min(Math.max(height, minHeight), maxHeight)
    }

    const onPointerDown = (evt) => {
        evt.preventDefault() // avoid text selection while dragging
        evt.currentTarget.setPointerCapture(evt.pointerId)
        isDraggingRef.current = true

        onResizeStart?.()
        evt.currentTarget.style.cursor = 'grabbing'
        document.body.style.cursor = 'grabbing'
    }

    const onPointerMove = (evt) => {
        if (isDraggingRef.current) {
            onResize?.(getHeight(evt.clientY))
        }
    }

    const endDrag = (evt) => {
        isDraggingRef.current = false
        evt.currentTarget.releasePointerCapture(evt.pointerId)
        evt.currentTarget.style.removeProperty('cursor')
        document.body.style.removeProperty('cursor')
    }

    const onPointerUp = (evt) => {
        if (!isDraggingRef.current) {
            return
        }
        endDrag(evt)
        onResizeEnd?.(getHeight(evt.clientY))
    }

    const onPointerCancel = (evt) => {
        if (!isDraggingRef.current) {
            return
        }
        endDrag(evt)
        onResizeCancel?.()
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
            onPointerCancel={onPointerCancel}
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
    onResizeCancel: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onResizeStart: PropTypes.func,
}

export default ResizeHandleControl
