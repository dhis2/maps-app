import { config, getInstance as getD2 } from 'd2';
import { getPeriodNameFromId } from './analytics';
import { loadDataItemLegendSet } from './legend';

const NAMESPACE = 'analytics';
const CURRENT_AO_KEY = 'currentAnalyticalObject';

const APP_URLS = {
    CHART: 'dhis-web-data-visualizer',
    PIVOT: 'dhis-web-pivot',
};

// Returns the data items of the first dx dimension in an analytical object
export const getDataDimensionsFromAnalyticalObject = ao => {
    const { columns, rows, filters } = ao;

    // TODO: Should filters be included?
    const dataDim = [...columns, ...rows, ...filters].find(
        i => i.dimension === 'dx'
    );

    // We only use the first dx dimension
    return dataDim ? dataDim.items : [];
};

// Checks if anaytical object is valid as a map layer
export const isValidAnalyticalObject = ao => {
    const { columns, rows, filters } = ao;
    const dimensions = [...columns, ...rows, ...filters];
    const dataItems = dimensions.filter(i => i.dimension === 'dx');

    return dataItems.length === 1 && dataItems[0].items.length === 1;
};

// Returns a thematic layer config from an analytical object
export const getThematicLayerFromAnalyticalObject = async (
    ao,
    dataId,
    isVisible = true
) => {
    const { columns, rows, filters, yearlySeries, aggregationType } = ao;
    const dimensions = [...columns, ...rows, ...filters];
    const dataDims = getDataDimensionsFromAnalyticalObject(ao);
    const orgUnits = dimensions.find(i => i.dimension === 'ou');
    let period = dimensions.find(i => i.dimension === 'pe');
    let dataDim = dataDims[0];

    if (dataId) {
        dataDim = dataDims.find(item => item.id === dataId);
    }

    // Load default legend set for selected data diemension
    const legendSet = await loadDataItemLegendSet(dataDim);

    // Currently we only support one period in map filters so we select the first
    if (yearlySeries && yearlySeries.length) {
        period = {
            dimension: 'pe',
            items: [
                {
                    id: yearlySeries[0],
                    name: getPeriodNameFromId(yearlySeries[0]),
                },
            ],
        };
    }

    return {
        layer: 'thematic',
        columns: [{ dimension: 'dx', items: [dataDim] }],
        rows: [orgUnits],
        filters: [period],
        aggregationType,
        legendSet,
        isVisible,
    };
};

// Translates a thematic layer to an analytical object
export const getAnalyticalObjectFromThematicLayer = layer => {
    const { columns, rows, filters, aggregationType } = layer;

    return {
        columns,
        rows,
        filters,
        aggregationType,
    };
};

// Returns or creates "analytics" namespace in user data store
const getAnalyticsNamespace = async () => {
    const d2 = await getD2();
    const { dataStore } = d2.currentUser;
    const hasNamespace = await dataStore.has(NAMESPACE);

    return hasNamespace
        ? await dataStore.get(NAMESPACE)
        : await dataStore.create(NAMESPACE);
};

// Returns current analytical object from user data store
export const getCurrentAnalyticalObject = async () => {
    const ns = await getAnalyticsNamespace();
    return ns.get(CURRENT_AO_KEY);
};

// Sets current analytical object in user data store
export const setCurrentAnalyticalObject = async ao => {
    const ns = await getAnalyticsNamespace();
    return ns.set(CURRENT_AO_KEY, ao);
};

// Sets analytical object to open it in another app
export const setAnalyticalObjectAndSwitchApp = async (layer, openAs) => {
    const ao = getAnalyticalObjectFromThematicLayer(layer);
    const url = `${config.appUrl}/${
        APP_URLS[openAs]
    }/#/currentAnalyticalObject`;

    await setCurrentAnalyticalObject(ao);

    window.location.href = url;
};
