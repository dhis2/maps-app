import AppAdapter from '@dhis2/app-adapter'
import { CssReset } from '@dhis2/ui'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { PluginHostApp } from './PluginHostApp.jsx'

// The parts of the app shell's AppAdapter config (.d2/shell/src/App.jsx) the
// host needs. Without a base URL (dev), AppAdapter uses the server stored in
// localStorage or asks for it in its login modal.
const config = {
    url: process.env.REACT_APP_DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
    appUrlSlug: process.env.DHIS2_APP_URL_SLUG || '',
    appVersion: process.env.REACT_APP_DHIS2_APP_VERSION || '',
    apiVersion: Number.parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
}

createRoot(document.getElementById('dhis2-app-root')).render(
    <>
        <CssReset />
        <AppAdapter {...config}>
            <PluginHostApp />
        </AppAdapter>
    </>
)
