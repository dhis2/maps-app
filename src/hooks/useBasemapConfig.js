import { useState, useEffect } from 'react';
import { useSystemSettings } from './SystemSettingsProvider';

const emptyBasemap = { config: {} };

function useBasemapConfig(selBasemap, basemaps) {
    const [basemap, setBasemap] = useState(emptyBasemap);
    const { systemSettings } = useSystemSettings();

    useEffect(() => {
        const selectedBasemap = Object.assign(
            {},
            { id: systemSettings.keyDefaultBaseMap },
            selBasemap
        );

        const basemapConfig =
            basemaps.find(({ id }) => id === selectedBasemap.id) ||
            emptyBasemap;

        setBasemap(Object.assign({}, basemapConfig, selectedBasemap));
    }, [systemSettings.keyDefaultBaseMap, selBasemap, basemaps]);

    return basemap;
}

export default useBasemapConfig;
