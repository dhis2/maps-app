import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import App from './app/App';
import { IntlProvider, addLocaleData } from 'react-intl';
import history from '../store/history';

const Root = ({ d2, store }) => {
    const locale = d2.currentUser.userSettings.settings.keyUiLocale || "en";
    addLocaleData(require(`react-intl/locale-data/${locale}`));

    return (
        <Provider store={store}>
            <IntlProvider locale={locale}>
                <App d2={d2} />
            </IntlProvider>
        </Provider>
    );
};

Root.propTypes = {
    store: PropTypes.object.isRequired,
    d2: PropTypes.object.isRequired,
};

export default Root;
