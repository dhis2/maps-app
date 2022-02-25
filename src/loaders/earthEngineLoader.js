import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import { precisionRound } from 'd3-format';
import { getEarthEngineLayer } from '../constants/earthEngine';
import { hasClasses, getPeriodNameFromFilter } from '../util/earthEngine';
import { getOrgUnitsFromRows } from '../util/analytics';
import { getDisplayProperty } from '../util/helpers';
import { numberPrecision } from '../util/numbers';
import { toGeoJson } from '../util/map';
import { getCoordinateField, setAdditionalGeometry } from '../util/orgUnits';

// Returns a promise
const earthEngineLoader = async config => {
    const { rows, aggregationType } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const coordinateField = getCoordinateField(config);
    let layerConfig = {};
    let dataset;
    let features;
    let alerts;

    if (orgUnits && orgUnits.length) {
        const d2 = await getD2();
        const displayProperty = getDisplayProperty(d2).toUpperCase();
        const orgUnitParams = orgUnits.map(item => item.id);

        const featuresRequest = d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty);

        try {
            features = await featuresRequest.getAll().then(toGeoJson);

            if (coordinateField) {
                const associatedGeometries = await featuresRequest
                    .getAll({
                        coordinateField: coordinateField.id,
                    })
                    .then(toGeoJson);

                features = features.concat(associatedGeometries);
                setAdditionalGeometry(features);
            }
        } catch (error) {
            alerts = [
                {
                    critical: true,
                    message: `${i18n.t('Error')}: ${error.message}`,
                },
            ];
        }

        if (Array.isArray(features) && !features.length) {
            alerts = [
                {
                    warning: true,
                    message: `${i18n.t('Selected org units')}: ${i18n.t(
                        'No coordinates found'
                    )}`,
                },
            ];
        }
    }

    if (typeof config.config === 'string') {
        // From database as favorite
        layerConfig = JSON.parse(config.config);

        // Backward compability for temperature layer (could also be fixed in a db update script)
        if (layerConfig.id === 'MODIS/MOD11A2' && layerConfig.filter) {
            const period = layerConfig.image.slice(-10);
            layerConfig.id = 'MODIS/006/MOD11A2';
            layerConfig.image = period;
            layerConfig.filter[0].arguments[1] = period;
        }

        // Backward compability for layers with periods saved before 2.36
        // (could also be fixed in a db update script)
        if (layerConfig.image) {
            const filter = layerConfig.filter?.[0];

            if (filter) {
                const period = filter.arguments?.[1];
                let name = String(layerConfig.image);

                if (typeof period === 'string' && period.length > 4) {
                    const year = period.substring(0, 4);
                    filter.year = parseInt(year, 10);

                    if (name.slice(-4) === year) {
                        name = name.slice(0, -4);
                    }
                }

                filter.name = name;
            }
        }

        dataset = getEarthEngineLayer(layerConfig.id);

        if (dataset) {
            dataset.datasetId = layerConfig.id;
            delete layerConfig.id;
        }

        delete config.config;
    } else {
        dataset = getEarthEngineLayer(layerConfig.id);
    }

    const layer = {
        ...dataset,
        ...config,
        ...layerConfig,
    };

    const { unit, filter, description, source, sourceUrl, band, bands } = layer;
    const { name } = dataset || config;
    const period = getPeriodNameFromFilter(filter);
    const data =
        Array.isArray(features) && features.length ? features : undefined;
    const hasBand = b =>
        Array.isArray(band) ? band.includes(b.id) : band === b.id;

    const groups =
        band && Array.isArray(bands) && bands.length
            ? bands.filter(hasBand)
            : null;

    const legend = {
        ...layer.legend,
        title: name,
        period,
        groups,
        unit,
        description,
        source,
        sourceUrl,
    };

    // Create/update legend items from params
    if (!hasClasses(aggregationType) && layer.params) {
        legend.items = createLegend(layer.params);
    }

    return {
        ...layer,
        legend,
        name,
        data,
        alerts,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export const createLegend = ({ min, max, palette }) => {
    const colors = palette.split(',');
    const step = (max - min) / (colors.length - (min > 0 ? 2 : 1));
    const precision = precisionRound(step, max);
    const valueFormat = numberPrecision(precision);

    let from = min;
    let to = valueFormat(min + step);

    return colors.map((color, index) => {
        const item = { color };

        if (index === 0 && min > 0) {
            // Less than min
            item.from = 0;
            item.to = min;
            item.name = '< ' + min;
            to = min;
        } else if (from < max) {
            item.from = from;
            item.to = to;
            item.name = from + ' - ' + to;
        } else {
            // Higher than max
            item.from = from;
            item.name = '> ' + from;
        }

        from = to;
        to = valueFormat(min + step * (index + (min > 0 ? 1 : 2)));

        return item;
    });
};

export default earthEngineLoader;
