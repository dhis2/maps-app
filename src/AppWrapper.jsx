import { InterpretationsProvider as AnalyticsInterpretationsProvider } from '@dhis2/analytics'
import { DataStoreProvider } from '@dhis2/app-service-datastore'
import { CssVariables } from '@dhis2/ui'
import log from 'loglevel'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import App from './components/app/App.jsx'
import {
    CachedDataProvider,
    useCachedData,
} from './components/cachedDataProvider/CachedDataProvider.jsx'
import OrgUnitsProvider from './components/OrgUnitsProvider.jsx'
import WindowDimensionsProvider from './components/WindowDimensionsProvider.jsx'
import store from './store/index.js'
import { USER_DATASTORE_NAMESPACE } from './util/analyticalObject.js'
import { appQueries, providerDataTransformation } from './util/app.js'
import './locales/index.js'

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
)

// Redirect legacy ?id=... query-param URLs to hash URLs via a real navigation
// so the v42 global shell never stores the query param and can't re-inject it
// on subsequent popstate events.
const redirectLegacyUrl = () => {
    const queryParams = queryString.parse(window.location.search, {
        parseBooleans: true,
    })
    const [base] = window.location.href.split('?')

    if (queryParams.id) {
        // /?id=ytkZY3ChM6J
        // /?id=ZBjCfSaLSqD&interpretationId=yKqhXZdeJ6a  (lowercase key also handled)
        const interpretationId =
            queryParams.interpretationId || queryParams.interpretationid
        const suffix = interpretationId
            ? `?interpretationId=${interpretationId}`
            : ''
        window.location.replace(`${base}#/${queryParams.id}${suffix}`)
    } else if (queryParams.currentAnalyticalObject === true) {
        // /?currentAnalyticalObject=true
        window.location.replace(`${base}#/currentAnalyticalObject`)
    }
}

redirectLegacyUrl()

const InterpretationsProvider = ({ children }) => {
    const { currentUser } = useCachedData()
    return (
        <AnalyticsInterpretationsProvider currentUser={currentUser}>
            {children}
        </AnalyticsInterpretationsProvider>
    )
}

InterpretationsProvider.propTypes = {
    children: PropTypes.node,
}

const AppWrapper = () => {
    return (
        <ReduxProvider store={store}>
            <DataStoreProvider namespace={USER_DATASTORE_NAMESPACE}>
                <CachedDataProvider
                    query={appQueries}
                    dataTransformation={providerDataTransformation}
                >
                    <WindowDimensionsProvider>
                        <OrgUnitsProvider>
                            <InterpretationsProvider>
                                <CssVariables colors elevations spacers theme />
                                <App />
                            </InterpretationsProvider>
                        </OrgUnitsProvider>
                    </WindowDimensionsProvider>
                </CachedDataProvider>
            </DataStoreProvider>
        </ReduxProvider>
    )
}

export default AppWrapper
