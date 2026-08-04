import { IconFilter16 } from '@dhis2/ui'
import React from 'react'
import styles from './styles/FilterActiveIcon.module.css'

const FilterActiveIcon = () => (
    <span className={styles.icon}>
        <IconFilter16 />
        <span className={styles.badge} />
    </span>
)

export default FilterActiveIcon
