import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import { IconDrag } from '../core/icons.jsx'
import styles from './styles/ResizeHandle.module.css'

// Pointer Events + setPointerCapture, not HTML5 drag-and-drop: a native drag
// session shows the browser's own drop-target cursor (grabbing/not-allowed/
// move) instead of any CSS cursor rule, and elements with no drop handling
// of their own (e.g. the map's WebGL canvas) count as invalid drop targets -
// showing "not-allowed" for as long as the pointer is over them. Pointer
// capture sidesteps that protocol entirely, and keeps reporting move/up
// events to this element even if the pointer leaves it (or the window)
// mid-drag - more reliable than a plain mousemove/mouseup pair for that case.
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
        // Set on both the handle and the body: the handle's own `cursor:
        // grab` CSS rule otherwise beats body's *inherited* cursor while the
        // pointer is over it, so body alone never actually shows grabbing
        // here - only once the pointer strays over something with no cursor
        // rule of its own (e.g. the map).
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
