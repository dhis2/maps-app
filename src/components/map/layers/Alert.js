import { AlertBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Alert.module.css'

const Alert = ({ message, critical, warning, onHidden }) => (
    <div className={styles.alert}>
        <AlertBar
            critical={critical}
            warning={warning}
            duration={10000}
            onHidden={onHidden}
        >
            {message}
        </AlertBar>
    </div>
)

Alert.propTypes = {
    message: PropTypes.string.isRequired,
    onHidden: PropTypes.func.isRequired,
    critical: PropTypes.string.boolean,
    warning: PropTypes.string.boolean,
}

export default Alert
