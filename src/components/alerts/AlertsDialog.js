import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import Dialog from 'material-ui/Dialog';
import Button from 'd2-ui/lib/button/Button';
import { clearAlerts } from '../../actions/alerts'
import { getMapAlerts } from '../../util/helpers'


const AlertsDialog = ({ alerts = [], clearAlerts }) => alerts.length && (
    <Dialog
        title={i18next.t('Notifications')}
        open={true}
        onRequestClose={clearAlerts}
        actions={<Button onClick={clearAlerts}>{i18next.t('Close')}</Button>}
    >{alerts.map((alert, index) => <div key={index}><strong>{alert.title}</strong>: {alert.description}</div>)}</Dialog>
);

AlertsDialog.propTypes = {
    mapAlerts: PropTypes.array,
};

export default connect(
    (state) => ({
        alerts: [ ...(state.alert ? [ state.alert ] : []), ...getMapAlerts(state.map)],
    }),
    { clearAlerts }
)(AlertsDialog);
