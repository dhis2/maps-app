import { AlertStack as UiAlertStack, AlertBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { clearAlerts } from '../../actions/alerts.js'
import { getMapAlerts } from '../../util/alerts.js'

export const AlertStack = ({ alerts = [], clearAlerts }) =>
    alerts.length ? (
        <UiAlertStack>
            {alerts.map(({ success, warning, critical, message }, index) => (
                <AlertBar
                    key={index}
                    success={success}
                    warning={warning}
                    critical={critical}
                    duration={10000}
                    onHidden={clearAlerts}
                >
                    {message}
                </AlertBar>
            ))}
        </UiAlertStack>
    ) : null

AlertStack.propTypes = {
    clearAlerts: PropTypes.func.isRequired,
    alerts: PropTypes.arrayOf(
        PropTypes.shape({
            message: PropTypes.string.isRequired,
            critical: PropTypes.bool,
            success: PropTypes.bool,
            warning: PropTypes.bool,
        })
    ),
}

export default connect(
    ({ alerts, map }) => ({
        alerts: [...alerts, ...getMapAlerts(map)],
    }),
    { clearAlerts }
)(AlertStack)
