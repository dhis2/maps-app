import { useDataEngine } from '@dhis2/app-runtime';
import PropTypes from 'prop-types';
import React, { useContext, useState, useEffect, createContext } from 'react';
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../constants/settings';

export const systemSettingsQuery = {
    resource: 'systemSettings',
    params: { key: SYSTEM_SETTINGS },
};

export const SystemSettingsCtx = createContext({});

const SystemSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState([]);
    const engine = useDataEngine();

    useEffect(() => {
        async function fetchData() {
            const { systemSettings } = await engine.query({
                systemSettings: systemSettingsQuery,
            });

            setSettings(
                Object.assign({}, DEFAULT_SYSTEM_SETTINGS, systemSettings)
            );
        }
        fetchData();
    }, []);

    return (
        <SystemSettingsCtx.Provider
            value={{
                systemSettings: settings,
            }}
        >
            {children}
        </SystemSettingsCtx.Provider>
    );
};

SystemSettingsProvider.propTypes = {
    children: PropTypes.node,
};

export default SystemSettingsProvider;

export const useSystemSettings = () => useContext(SystemSettingsCtx);
