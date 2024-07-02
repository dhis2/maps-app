import { useDataEngine } from '@dhis2/app-runtime';
import PropTypes from 'prop-types';
import React, { useContext, useState, useEffect, createContext } from 'react';

const systemInfoQuery = {
    resource: 'system/info',
    params: {
        fields: 'calendar',
    },
};

export const SystemInfoCtx = createContext({});

const SystemInfoProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const engine = useDataEngine();

    useEffect(() => {
        async function fetchData() {
            const { systemInfo } = await engine.query({
                systemInfo: systemInfoQuery,
            });

            setSettings(systemInfo);
        }
        fetchData();
    }, []);

    return (
        <SystemInfoCtx.Provider value={settings}>
            {children}
        </SystemInfoCtx.Provider>
    );
};

SystemInfoProvider.propTypes = {
    children: PropTypes.node,
};

export default SystemInfoProvider;

export const useSystemInfo = () => useContext(SystemInfoCtx);
