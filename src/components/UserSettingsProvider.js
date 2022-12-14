import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useContext, useState, useEffect, createContext } from 'react'

const userSettingsQuery = {
    resource: 'userSettings',
    params: {
        key: ['keyDbLocale', 'keyUiLocale', 'keyAnalysisDisplayProperty'],
    },
}

export const UserSettingsCtx = createContext({})

const UserSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({})
    const engine = useDataEngine()

    useEffect(() => {
        async function fetchData() {
            console.log('async fetch')
            const { userSettings } = await engine.query({
                userSettings: userSettingsQuery,
            })

            setSettings(userSettings)
        }
        console.log('UserSettings fetch')
        fetchData()
    }, [engine])

    return (
        <UserSettingsCtx.Provider value={settings}>
            {children}
        </UserSettingsCtx.Provider>
    )
}

UserSettingsProvider.propTypes = {
    children: PropTypes.node,
}

export default UserSettingsProvider

export const useUserSettings = () => useContext(UserSettingsCtx)
