import { IconDragHandle24 } from '@dhis2/ui'
import React, { useContext } from 'react'
import { DragHandleContext } from './dragHandleContext.js'
import styles from './styles/SortableHandle.module.css'

// Drag handle for reordering overlay layer cards. The actual drag listeners
// come from the dnd-kit useSortable hook in the parent SortableLayer and are
// passed down through DragHandleContext.
const SortableHandle = () => {
    const dragHandle = useContext(DragHandleContext)

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
