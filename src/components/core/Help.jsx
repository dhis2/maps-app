import { IconInfo16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Help.module.css'

// Adds info icon next to help content
const HelpWithIcon = ({ children }) => (
    <div className={styles.help}>
        <IconInfo16 />
        <div className={styles.content}>{children}</div>
    </div>
)

HelpWithIcon.propTypes = {
    children: PropTypes.node.isRequired,
}

export default HelpWithIcon
