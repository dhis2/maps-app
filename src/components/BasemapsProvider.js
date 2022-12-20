import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useContext, useState, useEffect, createContext } from 'react'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../constants/settings.js'

export const systemSettingsQuery = {
    resource: 'systemSettings',
    params: { key: SYSTEM_SETTINGS },
}

export const SystemSettingsCtx = createContext({})

const periodSetting = /keyHide(.*)Periods/

const getHiddenPeriods = (systemSettings) => {
    return Object.keys(systemSettings)
        .filter(
            (setting) => periodSetting.test(setting) && systemSettings[setting]
        )
        .map((setting) => setting.match(periodSetting)[1].toUpperCase())
}

const BasemapsProvider = ({ children }) => {
    const [settings, setSettings] = useState({})
    const engine = useDataEngine()

    useEffect(() => {
        async function fetchData() {
            const { systemSettings } = await engine.query({
                systemSettings: systemSettingsQuery,
            })

            setSettings(
                Object.assign({}, DEFAULT_SYSTEM_SETTINGS, systemSettings, {
                    hiddenPeriods: getHiddenPeriods(systemSettings),
                })
            )
        }
        fetchData()
    }, [engine])

    return (
        <SystemSettingsCtx.Provider value={settings}>
            {children}
        </SystemSettingsCtx.Provider>
    )
}

BasemapsProvider.propTypes = {
    children: PropTypes.node,
}

export default BasemapsProvider

export const useSystemSettings = () => useContext(SystemSettingsCtx)
