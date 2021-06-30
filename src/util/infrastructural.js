import { getInstance as getD2 } from 'd2';

// Loads settings and data for the infrastuctural dialog for org units
export const loadConfigurations = async () => {
    const d2 = await getD2();
    const api = d2.Api.getApi();
    const [
        infraPeriodType,
        infraIndicators,
        infraDataElements,
    ] = await Promise.all([
        api.get('configuration/infrastructuralPeriodType'),
        api.get('configuration/infrastructuralIndicators'),
        api.get('configuration/infrastructuralDataElements'),
    ]);

    const periodType = (infraPeriodType && infraPeriodType.id) || 'Yearly';
    const { indicators = [] } = infraIndicators || {};
    const { dataElements = [] } = infraDataElements || {};

    return {
        periodType: periodType.toUpperCase(),
        dataItems: [].concat(indicators, dataElements),
    };
};

export const loadData = async (id, period, dataItems) => {
    const d2 = await getD2();

    const analyticsRequest = new d2.analytics.request()
        .addDataDimension(dataItems.map(item => item.id))
        .addOrgUnitDimension(id)
        .addPeriodFilter(period);

    const data = await d2.analytics.aggregate.get(analyticsRequest);

    if (data.rows) {
        const dxIndex = data.headers.findIndex(header => header.name === 'dx');
        const valueIndex = data.headers.findIndex(
            header => header.name === 'value'
        );

        return data.rows
            .map(row => ({
                id: row[dxIndex],
                name: data.metaData.items[row[dxIndex]].name,
                value: row[valueIndex],
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
};
