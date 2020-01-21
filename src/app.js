import 'whatwg-fetch'

import React, { useEffect } from 'react';
import log from 'loglevel';
import { getUserSettings } from 'd2';
import { debounce } from 'lodash/fp';
import store from './store';
import Root from './components/Root';
import { configI18n } from './util/i18n';
import { loadOrgUnitTree } from './actions/orgUnits';
import { loadExternalLayers } from './actions/externalLayers';
import { setUserSettings } from './actions/user';
import { resizeScreen } from './actions/ui';
import { loadFavorite } from './actions/favorites';
import { getAnalyticalObject } from './actions/analyticalObject';
import { setGoogleCloudApiKey } from './actions/basemap';
import { getUrlParameter } from './util/requests';
import { ScreenCover, CircularLoader } from '@dhis2/ui-core';
import { D2Shim } from '@dhis2/app-runtime-d2-shim';

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
);

store.dispatch(loadOrgUnitTree());
store.dispatch(loadExternalLayers());

const onD2Initialized = async d2 => {
    const userSettings = await getUserSettings();

    store.dispatch(setUserSettings(userSettings));
    configI18n(userSettings);
    
    d2.system.settings
        .get('keyGoogleCloudApiKey')
        .then(key => store.dispatch(setGoogleCloudApiKey(key)));

    const mapId = getUrlParameter('id');
    if (mapId) {
        store.dispatch(loadFavorite(mapId));
    }

    // If analytical object is passed from another app
    const analyticalObject = getUrlParameter('currentAnalyticalObject');
    if (analyticalObject === 'true') {
        store.dispatch(getAnalyticalObject());
    }
}

const d2Config = {
    schemas : [
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
    ]
}

const useWindowResizeListener = () => {
    useEffect(() => {
        // Window resize listener: http://stackoverflow.com/questions/35073669/window-resize-react-redux
        const listener = debounce(150, () =>
            store.dispatch(resizeScreen(window.innerWidth, window.innerHeight))
        )
        window.addEventListener('resize', listener)
        return () => {
            window.removeEventListener('resize', listener)
        }
    }, [])
}

const MapsApp = () => {
    useWindowResizeListener()

    return (
        <D2Shim d2Config={d2Config} onInitialized={onD2Initialized}>
            {({ d2, d2Error}) => (
                <>
                    {d2Error && <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>{`D2 initialization error: ${d2Error}`}</div>}
                    {!d2 && !d2Error && (
                        <ScreenCover>
                            <CircularLoader />
                        </ScreenCover>
                    )}
                    {d2 && <Root d2={d2} store={store} />}
                </>
            )}
        </D2Shim>
    )
}

export default MapsApp;