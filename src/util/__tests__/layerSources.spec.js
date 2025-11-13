import buildingsLayerSource from '../../constants/earthEngineLayers/buildings_GOOGLE.js' // Group: none
import precipitationMonthlyLayerSource from '../../constants/earthEngineLayers/precipitation_monthly_ERA5-Land.js' // Group: precipitation
import precipitationWeeklyLayerSource from '../../constants/earthEngineLayers/precipitation_weekly_ERA5-Land.js' // Group: precipitation
import vegetationMonthlyLayerSource from '../../constants/earthEngineLayers/vegetation_monthly_MOD13Q1.js' // Group: vegetation
import {
    resolveGroupKey,
    groupLayerSources,
    getLayerSourceGroup,
} from '../layerSources.js'

const standardLayerSource = {
    layer: 'standard', // thematic, event, trackedEntity, facility, orgUnit
    type: 'Standard',
    img: 'images/standard.png',
    opacity: 0.5,
}
const externalLayerSource = {
    layer: 'external',
    img: 'images/featurelayer.png',
    name: 'Labels overlay',
    opacity: 1,
    config: {
        id: 'suB1SFdc6RD',
        type: 'tileLayer',
        url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png',
        attribution:
            '&copy; <a href=\\"http://www.openstreetmap.org/copyright\\">OpenStreetMap</a>, <a href=\\"https://carto.com/attributions\\">CARTO</a>',
        name: 'Labels overlay',
        tms: false,
        format: 'image/png',
    },
}

const PRECIPITATION_GROUP = 'precipitation'

describe('resolveGroupKey', () => {
    test('returns correct key depending on layer type and properties', () => {
        expect(resolveGroupKey(standardLayerSource)).toBe('standard')
        expect(resolveGroupKey(externalLayerSource)).toBe('suB1SFdc6RD')
        expect(resolveGroupKey(precipitationMonthlyLayerSource)).toBe(
            PRECIPITATION_GROUP
        )
        expect(resolveGroupKey(precipitationWeeklyLayerSource)).toBe(
            PRECIPITATION_GROUP
        )
        expect(resolveGroupKey(vegetationMonthlyLayerSource())).toBe(
            'vegetation'
        )
        expect(resolveGroupKey(buildingsLayerSource())).toBe(
            'GOOGLE/Research/open-buildings/v3/polygons'
        )
    })
})

describe('groupLayerSources', () => {
    test('groups Earth Engine layers by groupId and keeps standalone layers separate', () => {
        const layers = [
            standardLayerSource,
            externalLayerSource,
            precipitationMonthlyLayerSource(),
            precipitationWeeklyLayerSource(),
            vegetationMonthlyLayerSource(),
            buildingsLayerSource(),
        ]

        const grouped = groupLayerSources(layers)

        // Should return an array
        expect(Array.isArray(grouped)).toBe(true)

        // Standalone standard layer should be preserved
        const standard = grouped.find((l) => l.layer === 'standard')
        expect(standard).toBeDefined()
        expect(standard.type).toBe('Standard')

        // External layer should be preserved
        const external = grouped.find((l) => l.config?.id === 'suB1SFdc6RD')
        expect(external).toBeDefined()
        expect(external.layer).toBe('external')

        // Precipitation group should combine monthly and weekly layers
        const precipitationGroup = grouped.find(
            (l) => l.id === PRECIPITATION_GROUP
        )
        expect(precipitationGroup).toBeDefined()
        expect(Array.isArray(precipitationGroup.items)).toBe(true)
        expect(precipitationGroup.items.length).toBe(2)
        expect(precipitationGroup.items.map((i) => i.layerId)).toEqual(
            expect.arrayContaining([
                precipitationMonthlyLayerSource().layerId,
                precipitationWeeklyLayerSource().layerId,
            ])
        )

        // Vegetation group should exist and have 1 item
        const vegetationGroup = grouped.find((l) => l.id === 'vegetation')
        expect(vegetationGroup).toBeDefined()
        expect(vegetationGroup.items.length).toBe(1)
        expect(vegetationGroup.items[0].layerId).toBe(
            vegetationMonthlyLayerSource().layerId
        )

        // Buildings layer (no group) should be preserved
        const buildings = grouped.find(
            (l) => l.layerId === buildingsLayerSource().layerId
        )
        expect(buildings).toBeDefined()
        expect(buildings.layer).toBe('earthEngine')
    })

    test('does not add duplicate layers to group items', () => {
        const layers = [
            precipitationMonthlyLayerSource(),
            precipitationMonthlyLayerSource(), // duplicate
            precipitationWeeklyLayerSource(),
        ]

        const grouped = groupLayerSources(layers)
        const precipitationGroup = grouped.find(
            (l) => l.id === PRECIPITATION_GROUP
        )

        expect(precipitationGroup.items.length).toBe(2)
        expect(precipitationGroup.items.map((i) => i.layerId)).toEqual(
            expect.arrayContaining([
                precipitationMonthlyLayerSource().layerId,
                precipitationWeeklyLayerSource().layerId,
            ])
        )
    })
})

describe('getLayerSourceGroup', () => {
    test('returns empty array if layer has no group', () => {
        const result = getLayerSourceGroup(buildingsLayerSource().layerId)
        expect(result).toEqual([])
    })

    test('returns group with only the layer if no managed layers', () => {
        const result = getLayerSourceGroup(
            precipitationMonthlyLayerSource().layerId
        )
        expect(result.id).toBe(PRECIPITATION_GROUP)
        expect(Array.isArray(result.items)).toBe(true)
        expect(result.items.length).toBe(1)
        expect(result.items[0].layerId).toBe(
            precipitationMonthlyLayerSource().layerId
        )
    })

    test('includes managed layers from the same group', () => {
        const layerIds = [precipitationWeeklyLayerSource().layerId]
        const result = getLayerSourceGroup(
            precipitationMonthlyLayerSource().layerId,
            layerIds
        )

        expect(result.id).toBe(PRECIPITATION_GROUP)
        expect(result.items.length).toBe(2)
        const ids = result.items.map((i) => i.layerId)
        expect(ids).toEqual(
            expect.arrayContaining([
                precipitationMonthlyLayerSource().layerId,
                precipitationWeeklyLayerSource().layerId,
            ])
        )
    })

    test('does not include layers from other groups', () => {
        const layerIds = [vegetationMonthlyLayerSource().layerId]
        const result = getLayerSourceGroup(
            precipitationMonthlyLayerSource().layerId,
            layerIds
        )

        expect(result.id).toBe(PRECIPITATION_GROUP)
        expect(result.items.length).toBe(1)
        expect(result.items[0].layerId).toBe(
            precipitationMonthlyLayerSource().layerId
        )
    })

    test('does not duplicate layers when a managed layer is the same as the main layer', () => {
        const layerIds = [precipitationMonthlyLayerSource().layerId]
        const result = getLayerSourceGroup(
            precipitationMonthlyLayerSource().layerId,
            layerIds
        )

        expect(result.items.length).toBe(1)
        expect(result.items[0].layerId).toBe(
            precipitationMonthlyLayerSource().layerId
        )
    })
})
