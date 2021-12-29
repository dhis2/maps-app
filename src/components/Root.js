import React from 'react';
import PropTypes from 'prop-types';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as DataProvider } from '@dhis2/app-runtime';
import { D2Shim } from '@dhis2/app-runtime-adapter-d2';
import { CenteredContent, CircularLoader } from '@dhis2/ui';
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

const Root = ({ store }) => (
    <DataProvider
        config={{
            baseUrl: process.env.DHIS2_BASE_URL,
            apiVersion,
        }}
    >
        <ReduxProvider store={store}>
            <D2Shim d2Config={d2Config} i18nRoot="./i18n_old">
                {({ d2, d2Error }) => {
                    if (!d2 && !d2Error) {
                        return (
                            <div
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: 0,
                                }}
                            >
                                <CenteredContent>
                                    <CircularLoader />
                                </CenteredContent>
                            </div>
                        );
                    }

                    return (
                        <SystemSettingsProvider>
                            <UserSettingsProvider>
                                <UserSettingsCtx.Consumer>
                                    {({ keyUiLocale }) => {
                                        if (!keyUiLocale) {
                                            return null;
                                        }
                                        i18n.changeLanguage(keyUiLocale);
                                        return <App />;
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

Root.propTypes = {
    store: PropTypes.object.isRequired,
};

export default Root;
