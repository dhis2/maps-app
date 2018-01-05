import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import { removeAlerts } from '../../actions/map'

const AlertsDialog = ({ alerts = [], removeAlerts }) => alerts.length && (
    <Dialog
        title={i18next.t('Notifications')}
        open={true}
        onRequestClose={removeAlerts}
        actions={<Button onClick={removeAlerts}>{i18next.t('Close')}</Button>}
    >{alerts.map((alert, index) => <div key={index}><strong>{alert.title}</strong>: {alert.description}</div>)}</Dialog>
);

AlertsDialog.propTypes = {
    alerts: PropTypes.array,
};

export default connect(
    ({ map }) => ({ // Concat alerts from map config and layers
        alerts: [].concat(...(map && map.alerts ? map.alerts : []))
            .concat(...(map && map.mapViews &&
                map.mapViews.filter(layer => layer.alerts)
                    .map(layer => layer.alerts))),
    }),
    { removeAlerts }
)(AlertsDialog);
