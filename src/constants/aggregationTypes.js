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
// TODO: Align names with thematic types
export const getEarthEngineAggregationTypes = () => [
    { id: 'min', name: i18n.t('Min') },
    { id: 'max', name: i18n.t('Max') },
    { id: 'mean', name: i18n.t('Mean') },
    { id: 'median', name: i18n.t('Median') },
    { id: 'sum', name: i18n.t('Sum') },
    { id: 'stdDev', name: i18n.t('Standard deviation') },
    { id: 'variance', name: i18n.t('Variance') },
    { id: 'count', name: i18n.t('Count') },
];

export const getEarthEngineAggregationType = id =>
    (getEarthEngineAggregationTypes().find(t => t.id === id) || {}).name;
