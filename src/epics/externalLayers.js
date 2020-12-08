import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs';
import * as types from '../constants/actionTypes';
import { addBasemap } from '../actions/basemap';
import { addExternalLayer } from '../actions/externalLayers';
import { errorActionCreator } from '../actions/helpers';
import { createExternalLayer } from '../util/external';

// Load external layers from Web API
export const loadExternalLayers = action$ =>
    action$.ofType(types.EXTERNAL_LAYERS_LOAD).mergeMap(() => {
        return Observable.from(loadExternalMapLayers())
            .mergeMap(collection => {
                const externalBaseMapLayers = collection
                    .filter(isBaseMap)
                    .map(createExternalLayer)
                    .map(addBasemap);

                const externalOverlayLayers = collection
                    .filter(isOverlay)
                    .map(createExternalLayer)
                    .map(addExternalLayer);
                return [...externalBaseMapLayers, ...externalOverlayLayers];
            })
            .catch(err => [
                errorActionCreator(types.EXTERNAL_LAYERS_LOAD_ERROR)(err),
            ]);
    });

const isBaseMap = layer => layer.mapLayerPosition === 'BASEMAP';
const isOverlay = layer => !isBaseMap(layer);

const loadExternalMapLayers = () =>
    getD2()
        .then(d2 =>
            d2.models.externalMapLayers.list({
                fields:
                    'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
                paging: false,
            })
        )
        .then(externalMapLayersCollection =>
            externalMapLayersCollection.toArray()
        );

export default combineEpics(loadExternalLayers);
