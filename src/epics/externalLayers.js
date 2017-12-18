import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import * as types from '../constants/actionTypes';
import { addBasemap } from '../actions/basemap';
import { addExternalOverlay } from '../actions/externalLayers';
import { errorActionCreator } from '../actions/helpers';

// Loade external layers from Web API
export const loadExternalLayers = (action$) => {
    const externalMapLayers$ = action$
        .ofType(types.EXTERNAL_LAYERS_LOAD)
        .mergeMap(loadExternalMapLayers)
        .concatAll();// Create separate action objects in the stream [[a1], [a2], [a2]] => [a1], [a2], [a3]

    const externalBaseMapLayers$ = externalMapLayers$
        .filter(isBaseMap)
        .map(createLayerConfig('External basemap'))
        .map(addBasemap);

    const externalOverlayLayers$ = externalMapLayers$
        .filter(isOverlay)
        .map(createLayerConfig('External layer'))
        .map(addExternalOverlay);

    return Observable.merge(externalBaseMapLayers$, externalOverlayLayers$);
};

const isBaseMap = layer => layer.mapLayerPosition === 'BASEMAP';
const isOverlay = layer => !isBaseMap(layer);

const loadExternalMapLayers = () =>
    getD2()
        .then(d2 => d2.models.externalMapLayers.list({
            fields: 'id,displayName~rename(name),service,url,attribution,mapService,layer,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
            paging: false,
        }))
        .then((externalMapLayersCollection) => externalMapLayersCollection.toArray())
        .catch(errorActionCreator(types.EXTERNAL_LAYERS_LOAD_ERROR));

// Create external layer config object
const createLayerConfig = (subTitle) => (layer) => {
    const config = {
        type: 'tileLayer',
        url: layer.url,
        attribution: layer.attribution,
    };

    if (layer.mapService === 'TMS') {
        config.tms = true;
    }

    if (layer.mapService === 'WMS') {
        config.type = 'wmsLayer';
        config.layers = layer.layers;

        if (layer.imageFormat === 'JPG') { // PNG is default
            config.format = 'image/jpeg';
        }
    }

    return {
        id: layer.id,
        type: 'external',
        title: layer.name,
        subtitle: subTitle, // layer.mapLayerPosition === 'BASEMAP' ? 'External basemap' : 'External layer', // TODO: i18n
        // img: layer.img, // TODO: Get from Web API
        opacity: 1,
        config,
    }
};

export default combineEpics(loadExternalLayers);