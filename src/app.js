import React from 'react';
import { render } from 'react-dom';
import { JssProvider, jss, createGenerateClassName } from 'react-jss';
import 'url-polyfill';
import log from 'loglevel';
import { init, config, getUserSettings, getManifest } from 'd2';
import { debounce } from 'lodash/fp';
import store from './store';
import Root from './components/Root';
import { configI18n } from './util/i18n';
import { loadOrgUnitTree } from './actions/orgUnits';
import { loadExternalLayers } from './actions/externalLayers';
import { setUserSettings } from './actions/user';
import { resizeScreen } from './actions/ui';
import { loadFavorite } from './actions/favorites';
import { setGoogleCloudApiKey } from './actions/basemap';
import { getUrlParameter } from './util/requests';

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
);

store.dispatch(loadOrgUnitTree());
store.dispatch(loadExternalLayers());

getManifest('manifest.webapp')
    .then(manifest => {
        const baseUrl =
            process.env.NODE_ENV === 'production'
                ? manifest.getBaseUrl()
                : DHIS_CONFIG.baseUrl;
        config.baseUrl = `${baseUrl}/api/31`;
        config.context = manifest.activities.dhis; // Added temporarily for util/api.js

        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);

        // Include all API endpoints in use by this app
        config.schemas = [
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
        ];
    })
    .then(getUserSettings)
    .then(userSettings => {
        store.dispatch(setUserSettings(userSettings));
        return userSettings;
    })
    .then(configI18n)
    .then(init)
    .then(
        d2 => {
            d2.system.settings
                .get('keyGoogleCloudApiKey')
                .then(key => store.dispatch(setGoogleCloudApiKey(key)));

            const mapId = getUrlParameter('id');
            if (mapId) {
                store.dispatch(loadFavorite(mapId));
            }

            // JSS initialization
            const generateClassName = createGenerateClassName();
            jss.options.insertionPoint = 'jss-insertion-point';

            render(
                <JssProvider jss={jss} generateClassName={generateClassName}>
                    <Root d2={d2} store={store} />
                </JssProvider>,
                document.getElementById('app')
            );
        },
        err => {
            log.error('Failed to initialize D2:', JSON.stringify(err));
            document.write(`D2 initialization error: ${err}`);
        }
    );

// Window resize listener: http://stackoverflow.com/questions/35073669/window-resize-react-redux
window.addEventListener(
    'resize',
    debounce(150, () =>
        store.dispatch(resizeScreen(window.innerWidth, window.innerHeight))
    )
);
