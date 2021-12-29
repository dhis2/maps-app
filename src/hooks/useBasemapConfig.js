import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSystemSettings } from '../components/SystemSettingsProvider';
import { defaultBasemapState } from '../reducers/map';

const emptyBasemap = { config: {} };

function useBasemapConfig(selBasemap) {
    const [basemap, setBasemap] = useState(emptyBasemap);
    const basemaps = useSelector(state => state.basemaps);
    const { systemSettings } = useSystemSettings();

    useEffect(() => {
        const selectedBasemap = Object.assign(
            {},
            defaultBasemapState,
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
