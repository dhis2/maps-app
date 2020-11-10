import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AlertStack as UiAlertStack, AlertBar } from '@dhis2/ui';
import { clearAlerts } from '../../actions/alerts';
import { getMapAlerts } from '../../util/alerts';

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
    ) : null;

AlertStack.propTypes = {
    alerts: PropTypes.arrayOf(
        PropTypes.shape({
            success: PropTypes.bool,
            warning: PropTypes.bool,
            critical: PropTypes.bool,
            message: PropTypes.string.isRequired,
        })
    ),
    clearAlerts: PropTypes.func.isRequired,
};

export default connect(
    ({ alerts, map }) => ({
        alerts: [...alerts, ...getMapAlerts(map)],
    }),
    { clearAlerts }
)(AlertStack);
