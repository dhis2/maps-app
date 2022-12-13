import { Provider as DataProvider } from '@dhis2/app-runtime'
import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import { DataStoreProvider } from '@dhis2/app-service-datastore'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { apiVersion } from '../constants/settings.js'
import i18n from '../locales/index.js'
import { NAMESPACE } from '../util/analyticalObject.js'
import App from './app/App.js'
import SystemSettingsProvider from './SystemSettingsProvider.js'
import UserSettingsProvider, {
    UserSettingsCtx,
} from './UserSettingsProvider.js'

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
}

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
                        )
                    }

                    return (
                        <DataStoreProvider namespace={NAMESPACE}>
                            <SystemSettingsProvider>
                                <UserSettingsProvider>
                                    <UserSettingsCtx.Consumer>
                                        {({ keyUiLocale }) => {
                                            if (!keyUiLocale) {
                                                return null
                                            }
                                            i18n.changeLanguage(keyUiLocale)
                                            moment.locale(keyUiLocale)
                                            return <App />
                                        }}
                                    </UserSettingsCtx.Consumer>
                                </UserSettingsProvider>
                            </SystemSettingsProvider>
                        </DataStoreProvider>
                    )
                }}
            </D2Shim>
        </ReduxProvider>
    </DataProvider>
)

Root.propTypes = {
    store: PropTypes.object.isRequired,
}

export default Root
