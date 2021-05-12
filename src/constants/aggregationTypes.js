import i18n from '@dhis2/d2-i18n';

// Thematic layer
export const getThematicAggregationTypes = () => [
    { id: 'DEFAULT', name: i18n.t('By data element') },
    { id: 'COUNT', name: i18n.t('Count') },
    { id: 'AVERAGE', name: i18n.t('Average') },
    { id: 'SUM', name: i18n.t('Sum') },
    { id: 'STDDEV', name: i18n.t('Standard deviation') },
    { id: 'VARIANCE', name: i18n.t('Variance') },
    { id: 'MIN', name: i18n.t('Min') },
    { id: 'MAX', name: i18n.t('Max') },
];

// Earth Engine layer
export const getEarthEngineStatisticTypes = () => [
    { id: 'percentage', name: i18n.t('Percentage') },
    { id: 'hectares', name: i18n.t('Hectares') },
    { id: 'acres', name: i18n.t('Acres') },
];

// Earth Engine layer
export const getEarthEngineAggregationTypes = filter => {
    const types = [
        { id: 'min', name: i18n.t('Min') },
        { id: 'max', name: i18n.t('Max') },
        { id: 'mean', name: i18n.t('Mean') },
        { id: 'median', name: i18n.t('Median') },
        { id: 'sum', name: i18n.t('Sum') },
        { id: 'stdDev', name: i18n.t('Standard deviation') },
        { id: 'variance', name: i18n.t('Variance') },
    ];

    return filter ? types.filter(({ id }) => filter.includes(id)) : types;
};

export const getEarthEngineStatisticType = id =>
    (getEarthEngineStatisticTypes().find(t => t.id === id) || {}).name;

export const getEarthEngineAggregationType = id =>
    (getEarthEngineAggregationTypes().find(t => t.id === id) || {}).name;
