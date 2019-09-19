import * as types from '../constants/actionTypes';
import { errorActionCreator } from '../actions/helpers';
import { dataDownloadSuccess } from '../actions/dataDownload';

import { getInstance as getD2 } from 'd2';
import {
    downloadGeoJson,
    META_DATA_FORMAT_ID,
    META_DATA_FORMAT_CODE,
    META_DATA_FORMAT_NAME,
} from '../util/geojson';
import { getDisplayPropertyUrl } from '../util/helpers';

import {
    loadData as loadEventData,
    getAnalyticsRequest,
} from '../loaders/eventLoader';

import { combineEpics } from 'redux-observable';

const formatEnum = {
    [META_DATA_FORMAT_ID]: 'id',
    [META_DATA_FORMAT_NAME]: 'name',
    [META_DATA_FORMAT_CODE]: 'code',
};

const getEventColumns = async (layer, format) => {
    const d2 = await getD2();
    const result = await d2.models.programStage.get(layer.programStage.id, {
        fields: `programStageDataElements[displayInReports,dataElement[id,code,${getDisplayPropertyUrl(
            d2
        )},optionSet]]`,
        paging: false,
    });
    let formatKey = formatEnum[format];
    return result.programStageDataElements
        .filter(el => el.displayInReports)
        .map(el => ({
            dimension: el.dataElement.id,
            name: el.dataElement[formatKey],
        }));
};

// Includes values for each period in feature properties
const includeValuesByPeriod = ({ data, valuesByPeriod }) => {
    const periods = Object.keys(valuesByPeriod);

    return data.map(feature => ({
        ...feature,
        properties: {
            ...feature.properties,
            ...periods.reduce((values, periodId) => {
                const periodValue = valuesByPeriod[periodId][feature.id];

                values[`period_${periodId}`] = periodValue
                    ? Number(periodValue.value)
                    : null;

                return values;
            }, {}),
        },
    }));
};

const loadData = async (layer, format, humanReadableKeys) => {
    const layerType = layer.layer;
    if (layerType === 'event') {
        const columns = await getEventColumns(layer, format);
        const config = {
            ...layer,
            columns,
            outputIdScheme: humanReadableKeys ? 'NAME' : 'ID',
            columnNames: columns.reduce((res, col) => {
                res[col.dimension] = col.name;
                return res;
            }, {}),
        };
        const result = await loadEventData(
            await getAnalyticsRequest(config),
            config
        );
        return result.data;
    }
    if (layer.valuesByPeriod) {
        return includeValuesByPeriod(layer);
    }

    return layer.data;
};

const downloadData = action$ =>
    action$.ofType(types.DATA_DOWNLOAD_START).concatMap(async action => {
        try {
            const { layer, format, humanReadableKeys } = action.payload;
            const data = await loadData(layer, format, humanReadableKeys);

            await downloadGeoJson({
                name: layer.name,
                data: data,
            });
            return dataDownloadSuccess();
        } catch (e) {
            return errorActionCreator(types.DATA_DOWNLOAD_FAILURE)(e);
        }
    });

export default combineEpics(downloadData);
