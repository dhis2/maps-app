import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    IconErrorFilled16,
    IconInfoFilled16,
    IconWarningFilled16,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { ALERT_SEVERITY } from '../../constants/layerAlerts.js'
import {
    formatAlertDetails,
    getDetailRows,
    isLayerAlert,
    sortBySeverity,
} from '../../util/layerAlerts.js'
import styles from './styles/LayerAlerts.module.css'

const ICONS = {
    [ALERT_SEVERITY.ERROR]: <IconErrorFilled16 />,
    [ALERT_SEVERITY.WARNING]: <IconWarningFilled16 />,
    [ALERT_SEVERITY.INFO]: <IconInfoFilled16 />,
}

// Clicks must not reach the plugin legend, which pins on click
const handleClick = (onClick) => (event) => {
    event.stopPropagation()
    onClick()
}

const LayerAlert = ({ alert, layerName, layerType }) => {
    const { serverVersion, appVersion } = useConfig()
    const [showDetails, setShowDetails] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const { severity, title, description, details } = alert

    const copyDetails = async () => {
        await navigator.clipboard.writeText(
            formatAlertDetails(alert, {
                layerName,
                layerType,
                serverVersion,
                appVersion,
            })
        )
        setIsCopied(true)
    }

    return (
        <div
            className={cx(styles.alert, styles[severity])}
            data-test={`layer-alert-${severity}`}
        >
            <span className={styles.icon}>{ICONS[severity]}</span>
            <div className={styles.body}>
                <div className={styles.title}>{title}</div>
                {description && (
                    <div className={styles.description}>{description}</div>
                )}
                {details && (
                    <>
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.link}
                                onClick={handleClick(() =>
                                    setShowDetails(!showDetails)
                                )}
                            >
                                {showDetails
                                    ? i18n.t('Hide details')
                                    : i18n.t('Details')}
                            </button>
                            {showDetails && (
                                <button
                                    type="button"
                                    className={styles.link}
                                    onClick={handleClick(copyDetails)}
                                >
                                    {isCopied
                                        ? i18n.t('Copied')
                                        : i18n.t('Copy')}
                                </button>
                            )}
                        </div>
                        {showDetails && (
                            <dl
                                className={styles.details}
                                data-test="layer-alert-details"
                            >
                                {getDetailRows(details).map(
                                    ([label, value]) => (
                                        <div key={label}>
                                            <dt>{label}:</dt> <dd>{value}</dd>
                                        </div>
                                    )
                                )}
                            </dl>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

LayerAlert.propTypes = {
    alert: PropTypes.shape({
        severity: PropTypes.oneOf(Object.values(ALERT_SEVERITY)).isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        details: PropTypes.object,
        id: PropTypes.string,
    }).isRequired,
    layerName: PropTypes.string,
    layerType: PropTypes.string,
}

const NO_ALERTS = []

// Renders the alerts in this format, errors first
const LayerAlerts = ({ alerts = NO_ALERTS, layerName, layerType }) => {
    const layerAlerts = sortBySeverity(alerts.filter(isLayerAlert))

    if (!layerAlerts.length) {
        return null
    }

    return (
        <div className={styles.alerts}>
            {layerAlerts.map((alert, index) => (
                <LayerAlert
                    key={`${alert.id}-${index}`}
                    alert={alert}
                    layerName={layerName}
                    layerType={layerType}
                />
            ))}
        </div>
    )
}

LayerAlerts.propTypes = {
    alerts: PropTypes.array,
    layerName: PropTypes.string,
    layerType: PropTypes.string,
}

export default LayerAlerts
