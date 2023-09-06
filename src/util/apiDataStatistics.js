export const dataStatisticsMutation = {
    resource: 'dataStatistics',
    params: ({ id }) => ({
        favorite: id,
        eventType: 'VISUALIZATION_VIEW',
    }),
    type: 'create',
}
