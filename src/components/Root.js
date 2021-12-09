import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import App from './app/App';
import SystemSettingsProvider from '../hooks/SystemSettingsProvider';

const Root = ({ store, ...appProps }) => (
    <Provider store={store}>
        <SystemSettingsProvider>
            <App {...appProps} />
        </SystemSettingsProvider>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
};

export default Root;
