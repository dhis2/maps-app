import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
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
    const config = {
        type: 'tileLayer',
        url: layer.url,
        attribution: layer.attribution,
        name: layer.name,
    };

    if (layer.mapService === 'TMS') {
        config.tms = true;
    }

    if (layer.mapService === 'WMS') {
        config.type = 'wmsLayer';
        config.layers = layer.layers;

        if (layer.imageFormat === 'JPG') {
            // PNG is default
            config.format = 'image/jpeg';
        }
    }

    return {
        id: layer.id,
        layer: 'external',
        name: layer.name,
        // subtitle: subTitle, // layer.mapLayerPosition === 'BASEMAP' ? 'External basemap' : 'External layer', // TODO: i18n
        // img: layer.img, // TODO: Get from Web API
        opacity: 1,
        config,
    };
};

export default combineEpics(loadExternalLayers);
