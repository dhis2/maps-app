export const dataStatisticsMutation = {
    resource: 'dataStatistics',
    params: ({ id }) => ({
        favorite: id,
        eventType: 'MAP_VIEW',
    }),
    type: 'create',
}
