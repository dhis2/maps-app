import i18n from '@dhis2/d2-i18n';
import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { loadEarthEngineApi } from '../components/map/MapApi';
import { apiFetch } from '../util/api';
import { setEarthEngineCollection } from '../actions/earthEngine';
import { errorActionCreator } from '../actions/helpers';
import { setAlert } from '../actions/alerts';
import { getCollection } from '../util/earthEngine';

const setAuthToken = async ({ client_id, access_token, expires_in }) =>
    new Promise((resolve, reject) => {
        ee.data.setAuthToken(client_id, 'Bearer', access_token, expires_in);
        ee.initialize(null, null, resolve, reject);
    });

// Load collection (periods) for one EE dataset
export const loadCollection = action$ =>
    action$
        .ofType(types.EARTH_ENGINE_COLLECTION_LOAD)
        .concatMap(async action => {
            const token = await apiFetch('/tokens/google').catch(
                errorActionCreator(types.EARTH_ENGINE_COLLECTION_LOAD_ERROR)
            );

            if (token && token.status === 'ERROR') {
                return setAlert({
                    warning: true,
                    message: i18n.t(
                        'This layer requires a Google Earth Engine account. Check the DHIS2 documentation for more information.'
                    ),
                });
            }

            if (!window.ee && loadEarthEngineApi) {
                await loadEarthEngineApi();
            }

            try {
                await setAuthToken(token);
            } catch (e) {
                return setAlert({
                    critical: true,
                    message: i18n.t('Cannot connect to Google Earth Engine.'),
                });
            }

            return getCollection(action.id).then(data =>
                setEarthEngineCollection(action.id, data)
            );
        });

export default combineEpics(loadCollection);
