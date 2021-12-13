import React from 'react';
import PropTypes from 'prop-types';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as DataProvider } from '@dhis2/app-runtime';
import { D2Shim } from '@dhis2/app-runtime-adapter-d2';
import UserSettingsProvider, { UserSettingsCtx } from './UserSettingsProvider';
import SystemSettingsProvider from './SystemSettingsProvider';
import { apiVersion } from '../constants/settings';
import App from './app/App';

import i18n from '../locales';

const d2Config = {
    schemas: [
        'dataElement',
        'dataElementGroup',
        'dataSet',
        'externalMapLayer',
        'indicator',
        'indicatorGroup',
        'legendSet',
        'map',
        'optionSet',
        'organisationUnit',
        'organisationUnitGroup',
        'organisationUnitGroupSet',
        'organisationUnitLevel',
        'program',
        'programStage',
        'userGroup',
    ],
};

const Root = ({ store, ...appProps }) => {
    return (
        <DataProvider
            config={{
                baseUrl: process.env.DHIS2_BASE_URL,
                apiVersion,
            }}
        >
            <ReduxProvider store={store}>
                <D2Shim d2Config={d2Config} i18nRoot="./i18n_old">
                    {({ d2 }) => {
                        if (!d2) {
                            // TODO: Handle errors in d2 initialization
                            return null;
                        }
                        return (
                            <SystemSettingsProvider>
                                <UserSettingsProvider>
                                    <UserSettingsCtx.Consumer>
                                        {({ userSettings }) => {
                                            if (!userSettings?.keyUiLocale) {
                                                return null;
                                            }
                                            i18n.changeLanguage(
                                                userSettings.keyUiLocale
                                            );
                                            return <App {...appProps} />;
                                        }}
                                    </UserSettingsCtx.Consumer>
                                </UserSettingsProvider>
                            </SystemSettingsProvider>
                        );
                    }}
                </D2Shim>
            </ReduxProvider>
        </DataProvider>
    );
};
Root.propTypes = {
    store: PropTypes.object.isRequired,
};

export default Root;
