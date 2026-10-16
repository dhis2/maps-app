export const RELATIVE_PERIODS = {
    THIS_MONTH: 'This month',
    LAST_MONTH: 'Last month',
    LAST_3_MONTHS: 'Last 3 months',
    LAST_12_MONTHS: 'Last 12 months',
    THIS_QUARTER: 'This quarter',
    LAST_QUARTER: 'Last quarter',
    LAST_4_QUARTERS: 'Last 4 quarters',
    THIS_YEAR: 'This year',
    LAST_YEAR: 'Last year',
    LAST_5_YEARS: 'Last 5 years',
}

// The dashboard's item filters ({ pe: [{ id, name }], ou: [...] }) from the
// period id and comma-separated org unit ids typed in the host page
export const getFilters = (period, orgUnitInput, orgUnits = []) => {
    const filters = {}
    const periodId = period.trim()
    const orgUnitIds = orgUnitInput
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)

    if (periodId) {
        filters.pe = [
            { id: periodId, name: RELATIVE_PERIODS[periodId] ?? periodId },
        ]
    }
    if (orgUnitIds.length) {
        filters.ou = orgUnitIds.map((id) => ({
            id,
            name: orgUnits.find((orgUnit) => orgUnit.id === id)?.name ?? id,
        }))
    }
    return filters
}

// The dashboard app only filters thematic and event layers
const isFilteredLayer = (mapView) => /thematic|event/.test(mapView.layer)

// What a dashboard filter on this dimension (pe, ou) would replace: its item
// ids in the first layer that dashboard filters apply to
export const getFilterPlaceholder = (map, dimension) => {
    const mapView = map.mapViews.find(isFilteredLayer)
    if (!mapView) {
        return 'No filterable layer'
    }
    const ids = [...mapView.rows, ...mapView.columns, ...mapView.filters]
        .filter((obj) => obj.dimension === dimension)
        .flatMap((obj) => obj.items.map((item) => item.id))
    return ids.join(', ') || 'None'
}

// Mirrors the dashboard app's getFilteredVisualization
export const applyDashboardFilters = (visualization, filters) => ({
    ...visualization,
    mapViews: visualization.mapViews.map((mapView) => {
        if (!isFilteredLayer(mapView)) {
            return mapView
        }

        const rows = mapView.rows.map((obj) => ({ ...obj }))
        const columns = mapView.columns.map((obj) => ({ ...obj }))
        const mapViewFilters = mapView.filters.map((obj) => ({ ...obj }))

        Object.entries(filters).forEach(([dimension, items]) => {
            const matches = [...rows, ...columns, ...mapViewFilters].filter(
                (obj) => obj.dimension === dimension
            )

            if (matches.length) {
                matches.forEach((obj) => (obj.items = items))
            } else {
                mapViewFilters.push({ dimension, items })
            }
        })

        return { ...mapView, rows, columns, filters: mapViewFilters }
    }),
})

// The props the dashboard app sends to a map item (IframePlugin)
export const getDashboardItemProps = (visualization) => ({
    isVisualizationLoaded: true,
    forDashboard: true,
    displayProperty: 'name',
    visualization,
    cacheId: `plugin-host-${visualization.id ?? 'item'}`,
    isParentCached: false,
})
