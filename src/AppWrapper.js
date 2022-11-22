import React from 'react'
// import 'url-polyfill';
import log from 'loglevel'
import { debounce } from 'lodash/fp'
import moment from 'moment'
import PropTypes from 'prop-types'
import { Provider as ReduxProvider } from 'react-redux'
import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import UserSettingsProvider, {
    UserSettingsCtx,
} from './components/UserSettingsProvider'
import SystemSettingsProvider from './components/SystemSettingsProvider'
import App from './components/app/App'
import store from './store'
import { resizeScreen } from './actions/ui'

import './locales'

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
)

// Window resize listener: http://stackoverflow.com/questions/35073669/window-resize-react-redux
window.addEventListener(
    'resize',
    debounce(150, () =>
        store.dispatch(resizeScreen(window.innerWidth, window.innerHeight))
    )
)

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

const AppWrapper = () => (
    <ReduxProvider store={store}>
        <D2Shim d2Config={d2Config}>
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
                    <SystemSettingsProvider>
                        <UserSettingsProvider>
                            <UserSettingsCtx.Consumer>
                                {({ keyUiLocale }) => {
                                    if (!keyUiLocale) {
                                        return null
                                    }
                                    moment.locale(keyUiLocale)
                                    return <App />
                                }}
                            </UserSettingsCtx.Consumer>
                        </UserSettingsProvider>
                    </SystemSettingsProvider>
                )
            }}
        </D2Shim>
    </ReduxProvider>
)

export default AppWrapper
