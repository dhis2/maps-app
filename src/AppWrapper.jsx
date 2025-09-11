import { DataStoreProvider } from '@dhis2/app-service-datastore'
import { CssVariables } from '@dhis2/ui'
import log from 'loglevel'
import queryString from 'query-string'
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import App from './components/app/App.jsx'
import { CachedDataProvider } from './components/cachedDataProvider/CachedDataProvider.jsx'
import OrgUnitsProvider from './components/OrgUnitsProvider.jsx'
import WindowDimensionsProvider from './components/WindowDimensionsProvider.jsx'
import store from './store/index.js'
import { USER_DATASTORE_NAMESPACE } from './util/analyticalObject.js'
import { appQueries, providerDataTransformation } from './util/app.js'
import './locales/index.js'
import history from './util/history.js'

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
)

const replaceLegacyUrl = () => {
    // support legacy urls
    const queryParams = queryString.parse(window.location.search, {
        parseBooleans: true,
    })
    const [base] = window.location.href.split('?')

    if (queryParams.id) {
        // /?id=ytkZY3ChM6J
        // /?id=ZBjCfSaLSqD&interpretationid=yKqhXZdeJ6a
        // /?id=ZBjCfSaLSqD&interpretationId=yKqhXZdeJ6a

        const interpretationId =
            queryParams.interpretationId || queryParams.interpretationid

        const interpretationQueryParams = interpretationId
            ? `?interpretationId=${interpretationId}`
            : ''

        // replace history && hash history
        window.history.replaceState(
            {},
            '',
            `${base}#/${queryParams.id}${interpretationQueryParams}`
        )
        history.replace(`/${queryParams.id}${interpretationQueryParams}`)
    } else if (queryParams.currentAnalyticalObject === true) {
        // /?currentAnalyticalObject=true

        // replace history && hash history
        window.history.replaceState({}, '', `${base}#/currentAnalyticalObject`)
        history.replace('/currentAnalyticalObject')
    }
}

const AppWrapper = () => {
    replaceLegacyUrl()

    return (
        <ReduxProvider store={store}>
            <DataStoreProvider namespace={USER_DATASTORE_NAMESPACE}>
                <CachedDataProvider
                    query={appQueries}
                    dataTransformation={providerDataTransformation}
                >
                    <WindowDimensionsProvider>
                        <OrgUnitsProvider>
                            <CssVariables colors elevations spacers theme />
                            <App />
                        </OrgUnitsProvider>
                    </WindowDimensionsProvider>
                </CachedDataProvider>
            </DataStoreProvider>
        </ReduxProvider>
    )
}

export default AppWrapper
