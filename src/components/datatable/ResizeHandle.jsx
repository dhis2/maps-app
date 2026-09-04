import PropTypes from 'prop-types'
import React from 'react'
import { IconDrag } from '../core/icons.jsx'
import styles from './styles/ResizeHandle.module.css'

// Pre-decoded so setDragImage doesn't fall back to the macOS Chrome globe icon
// when the image isn't yet `complete` on the dragstart tick.
// https://www.sam.today/blog/html5-dnd-globe-icon
const EMPTY_DRAG_IMAGE = new Image(1, 1)
EMPTY_DRAG_IMAGE.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const ResizeHandle = ({
    onResize,
    onResizeStart,
    onResizeEnd,
    minHeight = 50,
    maxHeight = 500,
}) => {
    let dragHeight = 0

    const onDragStart = (evt) => {
        // https://stackoverflow.com/questions/7680285/how-do-you-turn-off-setdragimage
        if (EMPTY_DRAG_IMAGE.complete) {
            evt.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0)
        }

        evt.dataTransfer.setData('text/plain', 'node') // Required to initialize dragging in Firefox

        onResizeStart?.()

        // https://stackoverflow.com/questions/23992091/drag-and-drop-directive-no-e-clientx-or-e-clienty-on-drag-event-in-firefox
        document.ondragover = onDrag
    }

    const onDrag = (evt) => {
        const height = getHeight(evt || window.event)

        if (height && onResize) {
            onResize(height)
            dragHeight = height
        }
    }

    const onDragEnd = (evt) => {
        const height = getHeight(evt)

        if (height && onResizeEnd) {
            onResizeEnd(height)
        }

        document.ondragover = null
    }

    const getHeight = (evt) => {
        if (evt.pageY) {
            const height = window.innerHeight - evt.pageY
            dragHeight =
                height < minHeight
                    ? minHeight
                    : height > maxHeight
                    ? maxHeight
                    : height
        }

        return dragHeight
    }

    return (
        <div
            className={styles.resizeHandle}
            draggable={true}
            onDragStart={(evt) => onDragStart(evt)}
            onDragEnd={(evt) => onDragEnd(evt)}
        >
            <IconDrag />
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
