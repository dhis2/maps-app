import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useContext, useState, useEffect, createContext } from 'react'

// TODO: use proper maps admin authority id
const mapsAdminAuthorityId = 'F_PROGRAM_TRACKED_ENTITY_ATTRIBUTE_GROUP_ADD'

const userSettingsQuery = {
    userSettings: {
        resource: 'userSettings',
        params: {
            key: ['keyDbLocale', 'keyUiLocale', 'keyAnalysisDisplayProperty'],
        },
    },
    isMapsAdmin: {
        resource: 'me/authorization',
        id: mapsAdminAuthorityId,
    },
}

export const UserSettingsCtx = createContext({})

const UserSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({})
    const engine = useDataEngine()

    useEffect(() => {
        async function fetchData() {
            const { userSettings, isMapsAdmin } = await engine.query(
                userSettingsQuery
            )

            setSettings({
                ...userSettings,
                nameProperty:
                    userSettings.keyAnalysisDisplayProperty === 'name'
                        ? 'displayName'
                        : 'displayShortName',
                isMapsAdmin,
            })
        }
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
