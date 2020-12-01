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

// Load external layers from Web API
export const loadExternalLayers = action$ =>
    action$.ofType(types.EXTERNAL_LAYERS_LOAD).mergeMap(() => {
        return Observable.from(loadExternalMapLayers())
            .mergeMap(collection => {
                const externalBaseMapLayers = collection
                    .filter(isBaseMap)
                    .map(createLayerConfig('External basemap'))
                    .map(addBasemap);

                const externalOverlayLayers = collection
                    .filter(isOverlay)
                    .map(createLayerConfig('External layer'))
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

// Create external layer config object
const createLayerConfig = () => layer => {
    const {
        id,
        name,
        attribution,
        mapService,
        url,
        layers,
        imageFormat,
        legendSet,
        legendSetUrl,
    } = layer;

    const config = {
        type: 'tileLayer',
        url,
        attribution,
        name,
    };

    if (mapService === 'TMS') {
        config.tms = true;
    }

    if (mapService === 'WMS') {
        config.type = 'wmsLayer';
        config.layers = layers;

        if (imageFormat === 'JPG') {
            // PNG is default
            config.format = 'image/jpeg';
        }
    }

    return {
        id,
        layer: 'external',
        name,
        opacity: 1,
        legendSet,
        legendSetUrl,
        config,
    };
};

export default combineEpics(loadExternalLayers);
