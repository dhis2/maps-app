import { IconDragHandle24 } from '@dhis2/ui'
import React from 'react'
import { useDragHandle } from './dragHandleContext.js'
import styles from './styles/SortableHandle.module.css'

const SortableHandle = () => {
    const dragHandle = useDragHandle()

    return (
        <div
            className={styles.handle}
            data-test="sortable-handle"
            {...dragHandle?.attributes}
            {...dragHandle?.listeners}
        >
            <IconDragHandle24 />
        </div>
    )
}

export default SortableHandle
