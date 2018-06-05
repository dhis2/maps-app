import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import Dialog from 'material-ui/Dialog';
import { Button } from '@dhis2/d2-ui-core';
import { clearAlerts } from '../../actions/alerts';
import { getMapAlerts } from '../../util/alerts';

export const AlertsDialog = ({ alerts = [], clearAlerts }) =>
    alerts.length && (
        <Dialog
            title={i18n.t('Notifications')}
            open
            onRequestClose={clearAlerts}
            actions={
                <Button onClick={clearAlerts}>{i18n.t('Close')}</Button>
            }
        >
            {alerts.map((alert, index) => (
                <div key={index}>
                    <strong>{alert.title}</strong>: {alert.description}
                </div>
            ))}
        </Dialog>
    );

AlertsDialog.propTypes = {
    alerts: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    })),
    clearAlerts: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        alerts: [
            ...(state.alert ? [state.alert] : []),
            ...getMapAlerts(state.map),
        ],
    }),
    { clearAlerts }
)(AlertsDialog);
