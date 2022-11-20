import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AlertStack as UiAlertStack, AlertBar } from '@dhis2/ui';
import { useAlerts } from '@dhis2/app-service-alerts';
import { getMapAlerts } from '../../util/alerts';
import { clearAlerts } from '../../actions/map';

const DEFAULT_DURATION = 6000;

export const AlertStack = () => {
    const alerts = useAlerts();
    const mapAlerts = useSelector(state => getMapAlerts(state.map));
    const dispatch = useDispatch();

    const clearMapAlerts = useCallback(() => {
        dispatch(clearAlerts());
    }, [dispatch]);

    return alerts.length || mapAlerts.length ? (
        <UiAlertStack>
            {alerts
                .map(({ message, options, remove }, index) => (
                    <AlertBar
                        key={`appalert-${index}`}
                        success={options.success}
                        warning={options.warning}
                        critical={options.critical}
                        duration={options.duration || DEFAULT_DURATION}
                        onHidden={remove}
                    >
                        {message}
                    </AlertBar>
                ))
                .concat(
                    mapAlerts.map(
                        (
                            { message, success, warning, critical, duration },
                            index
                        ) => (
                            <AlertBar
                                key={`mapalert-${index}`}
                                success={success}
                                warning={warning}
                                critical={critical}
                                duration={duration || DEFAULT_DURATION}
                                onHidden={clearMapAlerts}
                            >
                                {message}
                            </AlertBar>
                        )
                    )
                )}
        </UiAlertStack>
    ) : null;
};

export default AlertStack;
