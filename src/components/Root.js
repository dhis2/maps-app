import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import App from './app/App';
import SystemSettingsProvider from '../hooks/SystemSettingsProvider';

const Root = ({ d2, store }) => (
    <Provider store={store}>
        <SystemSettingsProvider>
            <App d2={d2} />
        </SystemSettingsProvider>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    d2: PropTypes.object.isRequired,
};

export default Root;
