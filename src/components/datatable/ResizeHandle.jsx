import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import { IconDrag } from '../core/icons.jsx'
import styles from './styles/ResizeHandle.module.css'

const ResizeHandle = ({
    onResize,
    onResizeStart,
    onResizeEnd,
    minHeight = 50,
    maxHeight = 500,
}) => {
    const isDraggingRef = useRef(false)

    const getHeight = (clientY) => {
        const height = window.innerHeight - clientY
        return height < minHeight
            ? minHeight
            : height > maxHeight
            ? maxHeight
            : height
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

    const onPointerUp = (evt) => {
        if (!isDraggingRef.current) {
            return
        }
        isDraggingRef.current = false
        evt.currentTarget.releasePointerCapture(evt.pointerId)
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

ResizeHandle.propTypes = {
    maxHeight: PropTypes.number.isRequired,
    minHeight: PropTypes.number,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onResizeStart: PropTypes.func,
}

export default ResizeHandle
