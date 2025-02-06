import PropTypes from 'prop-types'
import React from 'react'
import { IconDrag } from '../core/icons.jsx'
import styles from './styles/ResizeHandle.module.css'

// TODO: Remove globe cursor in chrome
// https://stackoverflow.com/questions/6771196/stopping-chrome-from-changing-cursor-to-a-globe-while-dragging-a-link

const ResizeHandle = ({ onResize, onResizeEnd, minHeight, maxHeight }) => {
    let dragHeight = 0

    const onDragStart = (evt) => {
        // Set the drag ghost image to a transparent 1x1px
        // https://stackoverflow.com/questions/7680285/how-do-you-turn-off-setdragimage
        const img = document.createElement('img')
        img.src =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        evt.dataTransfer.setDragImage(img, 0, 0)

        evt.dataTransfer.setData('text/plain', 'node') // Required to initialize dragging in Firefox

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
    minHeight: PropTypes.number.isRequired,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
}

ResizeHandle.defaultProps = {
    minHeight: 50,
    maxHeight: 500,
}

export default ResizeHandle
