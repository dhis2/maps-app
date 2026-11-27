import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/TableMessage.module.css'

// Why the table shows no rows, and what the user can do about it
const TableMessage = ({ title, description, action }) => (
    <div className={styles.message} data-test="data-table-message">
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
        {action && (
            <Button small secondary onClick={action.onClick}>
                {action.label}
            </Button>
        )}
    </div>
)

TableMessage.propTypes = {
    description: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    }),
}

export default TableMessage
