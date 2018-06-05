import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SvgIcon } from '@dhis2/d2-ui-core';
import './ResizeHandle.css';

const ResizeHandle = ({ onResize, onResizeEnd, minHeight, maxHeight }) => {
    let dragHeight = 0;

    const onDragStart = evt => {
        // Set the drag ghost image to a transparent 1x1px
        // https://stackoverflow.com/questions/7680285/how-do-you-turn-off-setdragimage
        const img = document.createElement('img');
        img.src =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        evt.dataTransfer.setDragImage(img, 0, 0);

        evt.dataTransfer.setData('text/plain', 'node'); // Required to initialize dragging in Firefox

        // https://stackoverflow.com/questions/23992091/drag-and-drop-directive-no-e-clientx-or-e-clienty-on-drag-event-in-firefox
        document.ondragover = onDrag;
    };

    const onDrag = evt => {
        const height = getHeight(evt || window.event);

        if (height && onResize) {
            onResize(height);
            dragHeight = height;
        }
    };

    const onDragEnd = evt => {
        const height = getHeight(evt);

        if (height && onResizeEnd) {
            onResizeEnd(height);
        }
    };

    const getHeight = evt => {
        if (evt.pageY) {
            const height = window.innerHeight - evt.pageY;
            dragHeight =
                height < minHeight
                    ? minHeight
                    : height > maxHeight ? maxHeight : height;
        }

        return dragHeight;
    };

    return (
        <div
            className="ResizeHandle"
            draggable={true}
            onDragStart={evt => onDragStart(evt)}
            // onDrag={(evt) => onDrag(evt)}
            onDragEnd={evt => onDragEnd(evt)}
        >
            <SvgIcon icon="DragHandle" />
        </div>
    );
};

ResizeHandle.propTypes = {
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    minHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
};

ResizeHandle.defaultProps = {
    minHeight: 50,
    maxHeight: 500,
};

export default ResizeHandle;
