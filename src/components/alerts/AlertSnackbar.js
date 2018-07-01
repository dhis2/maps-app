import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import { clearAlerts } from '../../actions/alerts';
import { getMapAlerts } from '../../util/alerts';

// Snackbar only shows one alert at a time - TODO: Merge with Message snackbar
export const AlertSnackbar = ({ alert, clearAlerts }) => alert ? (
    <Snackbar
        open={true}
        message={`${alert.title}: ${alert.description}`}
        autoHideDuration={5000}
        onRequestClose={clearAlerts}
    />
) : null;


AlertSnackbar.propTypes = {
    alert: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }),
    clearAlerts: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        alert: [ 
            ...(state.alert ? [state.alert] : []),
            ...getMapAlerts(state.map),
        ][0],
    }),
    { clearAlerts }
)(AlertSnackbar);
