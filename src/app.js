import React from 'react';
import { render } from 'react-dom';
import log from 'loglevel';
import { init, config, getUserSettings, getManifest } from 'd2/lib/d2';
import i18next from 'i18next';
import XHR from 'i18next-xhr-backend';
// import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import debounce from 'lodash/fp/debounce';
import store from './store';
import Root from './components/Root';
import { loadExternalLayers } from './actions/externalLayers';
import { setUserSettings } from './actions/user';
import { resizeScreen } from './actions/ui';
import '../scss/app.scss';

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE);

const configI18n = (userSettings) => {
    i18next
        .use(XHR)
        .init({
            returnEmptyString: false,
            fallbackLng: false,
            keySeparator: '|',
            backend: {
                loadPath: '/i18n/{{lng}}.json'
            }
        }, (err, t) => {
            const uiLocale = userSettings.keyUiLocale;
            if (uiLocale && uiLocale !== 'en') {
                i18next.changeLanguage(uiLocale);
            }
        });
};

store.dispatch(loadExternalLayers());

getManifest('manifest.webapp')
    .then((manifest) => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : DHIS_CONFIG.baseUrl;
        config.baseUrl = `${baseUrl}/api/29`;
        config.context = manifest.activities.dhis; // Added temporarily for util/api.js

        // console.log('context', manifest.activities.dhis);

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
        ];
    })
    .then(getUserSettings)
    .then(settings => {
        store.dispatch(setUserSettings(settings));
        return settings;
    })
    .then(configI18n)
    .then(init)
    .then((d2) => {
        if (!d2.currentUser.authorities.has('F_SYSTEM_SETTING')) {
            document.write(i18next.t('Access denied'));
            return;
        }

        render(<Root d2={d2} store={store} />, document.getElementById('app'));



        /*
        const api = d2.Api.getApi();
        api.get('locales/ui') // TODO: Is locales used?
            .then((locales) => {
                console.log('locales', locales);
            });
        */

    }, (err) => {
        log.error('Failed to initialize D2:', JSON.stringify(err));
        document.write(`D2 initialization error: ${err}`);
    });

// Window resize listener: http://stackoverflow.com/questions/35073669/window-resize-react-redux
window.addEventListener('resize', debounce(150, () => store.dispatch(resizeScreen(window.innerWidth, window.innerHeight))));