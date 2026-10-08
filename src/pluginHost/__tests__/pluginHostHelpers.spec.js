import {
    applyDashboardFilters,
    getDashboardItemProps,
    getFilterPlaceholder,
    getFilters,
} from '../pluginHostHelpers.js'

const thematicView = {
    layer: 'thematic1',
    columns: [{ dimension: 'dx', items: [{ id: 'dataItem' }] }],
    rows: [{ dimension: 'ou', items: [{ id: 'country' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
}
const facilityView = {
    layer: 'facility',
    columns: [],
    rows: [{ dimension: 'ou', items: [{ id: 'country' }] }],
    filters: [],
}
const map = { id: 'mapId', mapViews: [thematicView, facilityView] }

describe('getFilters', () => {
    it('returns no filters for empty inputs', () => {
        expect(getFilters('', ' ')).toEqual({})
    })

    it('names relative periods and keeps other period ids as names', () => {
        expect(getFilters(' LAST_YEAR ', '')).toEqual({
            pe: [{ id: 'LAST_YEAR', name: 'Last year' }],
        })
        expect(getFilters('2024', '')).toEqual({
            pe: [{ id: '2024', name: '2024' }],
        })
    })

    it('splits org unit ids and names the known ones', () => {
        const orgUnits = [{ id: 'bo', name: 'Bo' }]

        expect(getFilters('', 'bo, other ,', orgUnits)).toEqual({
            ou: [
                { id: 'bo', name: 'Bo' },
                { id: 'other', name: 'other' },
            ],
        })
    })
})

describe('applyDashboardFilters', () => {
    it('replaces the items of a dimension used by a thematic layer', () => {
        const filtered = applyDashboardFilters(map, {
            pe: [{ id: 'LAST_YEAR' }],
        })

        expect(filtered.mapViews[0].filters).toEqual([
            { dimension: 'pe', items: [{ id: 'LAST_YEAR' }] },
        ])
    })

    it('adds a dimension the layer does not use as a filter', () => {
        const filtered = applyDashboardFilters(map, {
            ouGroup: [{ id: 'group' }],
        })

        expect(filtered.mapViews[0].filters).toContainEqual({
            dimension: 'ouGroup',
            items: [{ id: 'group' }],
        })
    })

    it('only filters thematic and event layers', () => {
        const filtered = applyDashboardFilters(map, {
            ou: [{ id: 'district' }],
        })

        expect(filtered.mapViews[0].rows[0].items).toEqual([{ id: 'district' }])
        expect(filtered.mapViews[1]).toBe(facilityView)
    })

    it('does not change the visualization it is given', () => {
        applyDashboardFilters(map, { pe: [{ id: 'LAST_YEAR' }] })

        expect(thematicView.filters[0].items).toEqual([{ id: 'THIS_YEAR' }])
    })
})

describe('getFilterPlaceholder', () => {
    it('lists the items the filter would replace in the thematic layer', () => {
        expect(getFilterPlaceholder(map, 'pe')).toBe('THIS_YEAR')
        expect(getFilterPlaceholder(map, 'ou')).toBe('country')
    })

    it('says when the layer does not use the dimension', () => {
        expect(getFilterPlaceholder(map, 'ouGroup')).toBe('None')
    })

    it('says when no layer is filtered by dashboard filters', () => {
        expect(getFilterPlaceholder({ mapViews: [facilityView] }, 'pe')).toBe(
            'No filterable layer'
        )
    })
})

describe('getDashboardItemProps', () => {
    it('returns the props the dashboard app sends to a map item', () => {
        expect(getDashboardItemProps(map)).toEqual({
            isVisualizationLoaded: true,
            forDashboard: true,
            displayProperty: 'name',
            visualization: map,
            cacheId: 'plugin-host-mapId',
            isParentCached: false,
        })
    })

    it('uses a generic cache id for a visualization without id', () => {
        expect(getDashboardItemProps({}).cacheId).toBe('plugin-host-item')
    })
})
