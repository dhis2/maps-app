import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSystemSettings } from '../components/SystemSettingsProvider';
import { defaultBasemapState } from '../reducers/map';
import { getFallbackBasemap } from '../constants/basemaps';

const emptyBasemap = { config: {} };

function useBasemapConfig(selBasemap) {
    const [basemap, setBasemap] = useState(emptyBasemap);
    const basemaps = useSelector(state => state.basemaps);
    const { keyDefaultBaseMap } = useSystemSettings();

    useEffect(() => {
        const selectedBasemap = Object.assign(
            {},
            defaultBasemapState,
            { id: keyDefaultBaseMap },
            selBasemap
        );

        const basemapConfig =
            basemaps.find(({ id }) => id === selectedBasemap.id) ||
            getFallbackBasemap();

        setBasemap(Object.assign({}, basemapConfig, selectedBasemap));
    }, [keyDefaultBaseMap, selBasemap, basemaps]);

    return basemap;
}

export default useBasemapConfig;
