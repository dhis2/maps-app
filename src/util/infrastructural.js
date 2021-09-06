import { getInstance as getD2 } from 'd2';

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
