import i18n from '@dhis2/d2-i18n';

export const getAggregationTypes = () => [
    { id: 'DEFAULT', name: i18n.t('By data element') },
    { id: 'COUNT', name: i18n.t('Count') },
    { id: 'AVERAGE', name: i18n.t('Average') },
    { id: 'SUM', name: i18n.t('Sum') },
    { id: 'STDDEV', name: i18n.t('Standard deviation') },
    { id: 'VARIANCE', name: i18n.t('Variance') },
    { id: 'MIN', name: i18n.t('Min') },
    { id: 'MAX', name: i18n.t('Max') },
];
