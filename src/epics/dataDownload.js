import * as types from '../constants/actionTypes';
import { errorActionCreator } from '../actions/helpers';
import { dataDownloadSuccess } from '../actions/dataDownload';

import { getInstance as getD2 } from 'd2/lib/d2';
import { downloadGeoJson } from '../util/dataDownload';
import {
    getApiResponseNames,
    getOrgUnitsFromRows,
    getPeriodFromFilters,
} from '../util/analytics';
import { isValidCoordinate } from '../util/map';
import { getDisplayPropertyUrl } from '../util/helpers';
import {
    getAnalyticsRequest,
    createEventFeature,
} from '../loaders/eventLoader';
import { combineEpics } from 'redux-observable';

const getColumns = (d2, layer) =>
    d2.models.programStage
        .get(layer.programStage.id, {
            fields: `programStageDataElements[displayInReports,dataElement[id,${getDisplayPropertyUrl(
                d2
            )},optionSet]]`,
            paging: false,
        })
        .then(result => result.programStageDataElements)
        .then(data =>
            data.filter(el => el.displayInReports).map(el => ({
                dimension: el.dataElement.id,
                name: el.dataElement.name,
            }))
        );

const makeRequest = (d2, layer, columns) =>
    getAnalyticsRequest(
        layer.program,
        layer.programStage,
        getPeriodFromFilters(layer.filters),
        layer.startDate,
        layer.endDate,
        getOrgUnitsFromRows(layer.rows),
        columns,
        layer.eventCoordinateField,
        layer.relativePeriodDate
    ).then(req => d2.analytics.events.getQuery(req));

const parseResponseToFeatures = (layer, response) =>
    response.rows
        .map(row =>
            createEventFeature(
                response.headers,
                getApiResponseNames(response),
                row,
                layer.eventCoordinateField
            )
        )
        .filter(feature => isValidCoordinate(feature.geometry.coordinates));

const downloadData = action$ =>
    action$.ofType(types.DATA_DOWNLOAD_START).concatMap(action =>
        getD2()
            .then(d2 => {
                const layer = action.payload.layer;
                const layerType = layer.layer;
                if (layerType === 'event') {
                    return getColumns(d2, layer)
                        .then(columns => makeRequest(d2, layer, columns))
                        .then(response =>
                            parseResponseToFeatures(layer, response)
                        );
                }
                return layer.data;
            })
            .then(data =>
                downloadGeoJson({ name: action.payload.layer.name, data })
            )
            .then(() => dataDownloadSuccess())
            .catch(errorActionCreator(types.DATA_DOWNLOAD_FAILURE))
    );

export default combineEpics(downloadData);
