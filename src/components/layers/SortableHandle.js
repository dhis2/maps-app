import { IconDragHandle24 } from '@dhis2/ui'
import React from 'react'
import { SortableHandle } from 'react-sortable-hoc'
import styles from './styles/SortableHandle.module.css'

const Handle = () => (
    <div className={styles.handle}>
        <IconDragHandle24 />
    </div>
)

export default SortableHandle(Handle)
