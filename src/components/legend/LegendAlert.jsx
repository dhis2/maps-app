import i18n from '@dhis2/d2-i18n'
import { IconErrorFilled24, IconWarningFilled24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import {
    ERROR_CRITICAL,
    WARNING_NO_DATA,
    WARNING_ALL_EVENTS_OUTSIDE_OU,
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    WARNING_OU_BOUNDARIES_FETCH_FAILED,
} from '../../constants/alerts.js'
import styles from './styles/LegendAlert.module.css'

const getAlertContent = ({ code, message, critical }) => {
    switch (code) {
        case ERROR_CRITICAL:
            return {
                title: i18n.t('Failed to load layer'),
                body: message,
                isError: true,
            }
        case WARNING_NO_DATA:
            return {
                title: i18n.t('No data found'),
                body: null,
                isError: false,
            }
        case WARNING_ALL_EVENTS_OUTSIDE_OU:
            return {
                title: i18n.t('All events outside org unit boundaries'),
                body: null,
                isError: false,
            }
        case WARNING_NO_OU_COORD:
            return {
                title: i18n.t('No coordinates found'),
                body: null,
                isError: false,
            }
        case WARNING_NO_GEOMETRY_COORD:
            return {
                title: `${message}: ${i18n.t('No coordinates found')}`,
                body: null,
                isError: false,
            }
        case WARNING_OU_BOUNDARIES_FETCH_FAILED:
            return {
                title: i18n.t('Could not check org unit boundaries'),
                body: null,
                isError: false,
            }
        default:
            return { title: message, body: null, isError: !!critical }
    }
}

const LegendAlert = ({ alert }) => {
    const { title, body, isError } = getAlertContent(alert)
    return (
        <div
            className={cx(styles.alert, {
                [styles.error]: isError,
                [styles.warning]: !isError,
            })}
        >
            <span className={styles.icon}>
                {isError ? <IconErrorFilled24 /> : <IconWarningFilled24 />}
            </span>
            <span className={styles.body}>
                <strong className={styles.title}>{title}</strong>
                {body && <span className={styles.message}>{body}</span>}
            </span>
        </div>
    )
}

LegendAlert.propTypes = {
    alert: PropTypes.shape({
        code: PropTypes.string,
        critical: PropTypes.bool,
        message: PropTypes.string,
        warning: PropTypes.bool,
    }).isRequired,
}

export default LegendAlert
