import buildingsLayerSource from '../../constants/earthEngineLayers/buildings_GOOGLE.js' // Groupping: none
import populationAgeSexLayerSource from '../../constants/earthEngineLayers/population_age_sex_WorldPop.js' // Groupping: population
import populationTotalLayerSource from '../../constants/earthEngineLayers/population_total_WorldPop.js' // Groupping: population
import precipitationMonthlyCHIRPSLayerSource from '../../constants/earthEngineLayers/precipitation_monthly_CHIRPS.js' // Groupping: precipitation & precipitation_chirps
import precipitationMonthlyERA5LayerSource from '../../constants/earthEngineLayers/precipitation_monthly_ERA5-Land.js' // Groupping: precipitation & precipitation_era5
import precipitationWeeklyERA5LayerSource from '../../constants/earthEngineLayers/precipitation_weekly_ERA5-Land.js' // Groupping: precipitation & precipitation_era5
import vegetationMonthlyLayerSource from '../../constants/earthEngineLayers/vegetation_monthly_MOD13Q1.js' // Groupping: vegetation
import {
    resolveGroupKey,
    groupLayerSources,
    getLayerSourceGroupping,
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

describe('resolveGroupKey', () => {
    test('returns correct key depending on layer type and properties', () => {
        expect(resolveGroupKey(standardLayerSource)).toBe('standard')
        expect(resolveGroupKey(externalLayerSource)).toBe('suB1SFdc6RD')
        expect(resolveGroupKey(precipitationMonthlyERA5LayerSource())).toBe(
            'precipitation'
        )
        expect(resolveGroupKey(precipitationMonthlyCHIRPSLayerSource())).toBe(
            'precipitation'
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
            populationTotalLayerSource(),
            populationAgeSexLayerSource(),
            precipitationMonthlyERA5LayerSource(),
            precipitationWeeklyERA5LayerSource(),
            precipitationMonthlyCHIRPSLayerSource(),
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

        // Population group should combine ERA5 and CHIRPS layers
        const populationGroup = grouped.find((l) => l.id === 'population')
        expect(populationGroup).toBeDefined()
        expect(Array.isArray(populationGroup.items)).toBe(true)
        expect(populationGroup.items.length).toBe(2)
        expect(populationGroup.items.map((i) => i.id)).toEqual(
            expect.arrayContaining([
                populationTotalLayerSource().layerId,
                populationAgeSexLayerSource().layerId,
            ])
        )

        // Precipitation group should combine ERA5 and CHIRPS layers
        const precipitationGroup = grouped.find((l) => l.id === 'precipitation')
        expect(precipitationGroup).toBeDefined()
        expect(Array.isArray(precipitationGroup.items)).toBe(true)
        expect(precipitationGroup.items.length).toBe(2)
        expect(precipitationGroup.items.map((i) => i.id)).toEqual(
            expect.arrayContaining([
                precipitationMonthlyERA5LayerSource().groupping.subGroupId,
                precipitationWeeklyERA5LayerSource().groupping.subGroupId,
            ])
        )
        // Precipitation ERA5 sub-group should combine monthly and weekly layers
        const era5SubGroup = precipitationGroup.items.find(
            (l) => l.id === 'precipitation_era5'
        )
        expect(era5SubGroup).toBeDefined()
        expect(Array.isArray(era5SubGroup.items)).toBe(true)
        expect(era5SubGroup.items.length).toBe(2)
        expect(era5SubGroup.items.map((i) => i.layerId)).toEqual(
            expect.arrayContaining([
                precipitationMonthlyERA5LayerSource().layerId,
                precipitationWeeklyERA5LayerSource().layerId,
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
            precipitationMonthlyERA5LayerSource(),
            precipitationMonthlyERA5LayerSource(), // duplicate
            precipitationMonthlyCHIRPSLayerSource(),
        ]

        const grouped = groupLayerSources(layers)
        const precipitationGroup = grouped.find((l) => l.id === 'precipitation')

        expect(precipitationGroup.items.length).toBe(2)
        expect(precipitationGroup.items.map((i) => i.id)).toEqual(
            expect.arrayContaining([
                precipitationMonthlyERA5LayerSource().groupping.subGroupId,
                precipitationWeeklyERA5LayerSource().groupping.subGroupId,
            ])
        )
    })
})

describe('getLayerSourceGroupping', () => {
    const expectGroupItemIds = (
        group,
        { groupId, expectedIds, key = 'id' }
    ) => {
        if (groupId !== undefined) {
            expect(group?.id).toBe(groupId)
        }
        expect(Array.isArray(group.items)).toBe(true)
        expect(group.items.length).toBe(expectedIds.length)
        const actualIds = group.items.map((i) => i[key])
        expect(actualIds).toEqual(expect.arrayContaining(expectedIds))
    }

    test('returns empty array if layer has no group', () => {
        const result = getLayerSourceGroupping(buildingsLayerSource().layerId)
        expect(result).toEqual({})
    })

    test('returns group with only the layer if no managed layers', () => {
        const populationGroup = getLayerSourceGroupping(
            populationTotalLayerSource().layerId
        )
        const populationGroupData = populationGroup.data.group
        expectGroupItemIds(populationGroupData, {
            groupId: 'population',
            expectedIds: [populationTotalLayerSource().layerId],
        })
        expect(populationGroup).not.toHaveProperty('period')

        const precipitationGroup = getLayerSourceGroupping(
            precipitationMonthlyERA5LayerSource().layerId
        )
        const precipitationGroupData = precipitationGroup.data.group // Group
        expectGroupItemIds(precipitationGroupData, {
            groupId: 'precipitation',
            expectedIds: ['precipitation_era5'],
        })
        expectGroupItemIds(precipitationGroupData.items[0], {
            groupId: 'precipitation_era5',
            expectedIds: [precipitationMonthlyERA5LayerSource().layerId],
        })
        const precipitationGroupPeriod = precipitationGroup.period.group // Subgroup
        expectGroupItemIds(precipitationGroupPeriod, {
            groupId: 'precipitation_era5',
            expectedIds: [precipitationMonthlyERA5LayerSource().layerId],
        })
    })

    test('includes managed layers from the same group', () => {
        const populationLayerIds = [populationAgeSexLayerSource().layerId]
        const populationGroup = getLayerSourceGroupping(
            populationTotalLayerSource().layerId,
            populationLayerIds
        )
        const populationGroupData = populationGroup.data.group
        expectGroupItemIds(populationGroupData, {
            groupId: 'population',
            expectedIds: [
                populationAgeSexLayerSource().layerId,
                populationTotalLayerSource().layerId,
            ],
        })
        expect(populationGroup).not.toHaveProperty('period')

        const precipitationLayerIds = [
            precipitationMonthlyERA5LayerSource().layerId,
            precipitationMonthlyCHIRPSLayerSource().layerId,
        ]
        const precipitationGroup = getLayerSourceGroupping(
            precipitationWeeklyERA5LayerSource().layerId,
            precipitationLayerIds
        )
        const precipitationGroupData = precipitationGroup.data.group // Group
        expectGroupItemIds(precipitationGroupData, {
            groupId: 'precipitation',
            expectedIds: ['precipitation_era5', 'precipitation_chirps'],
        })
        expectGroupItemIds(precipitationGroupData.items[0], {
            groupId: 'precipitation_era5',
            expectedIds: [
                precipitationWeeklyERA5LayerSource().layerId,
                precipitationMonthlyERA5LayerSource().layerId,
            ],
        })
        expectGroupItemIds(precipitationGroupData.items[1], {
            groupId: 'precipitation_chirps',
            expectedIds: [precipitationMonthlyCHIRPSLayerSource().layerId],
        })
        const precipitationGroupPeriod = precipitationGroup.period.group // Subgroup
        expectGroupItemIds(precipitationGroupPeriod, {
            groupId: 'precipitation_era5',
            expectedIds: [
                precipitationMonthlyERA5LayerSource().layerId,
                precipitationWeeklyERA5LayerSource().layerId,
            ],
        })
    })

    test('does not include layers from other groups', () => {
        const layerIds = [vegetationMonthlyLayerSource().layerId]
        const populationGroup = getLayerSourceGroupping(
            populationTotalLayerSource().layerId,
            layerIds
        )
        const populationGroupData = populationGroup.data.group
        expectGroupItemIds(populationGroupData, {
            groupId: 'population',
            expectedIds: [populationTotalLayerSource().layerId],
        })
        expect(populationGroup).not.toHaveProperty('period')

        const precipitationGroup = getLayerSourceGroupping(
            precipitationMonthlyERA5LayerSource().layerId,
            layerIds
        )
        const precipitationGroupData = precipitationGroup.data.group // Group
        expectGroupItemIds(precipitationGroupData, {
            groupId: 'precipitation',
            expectedIds: ['precipitation_era5'],
        })
        expectGroupItemIds(precipitationGroupData.items[0], {
            groupId: 'precipitation_era5',
            expectedIds: [precipitationMonthlyERA5LayerSource().layerId],
        })
        const precipitationGroupPeriod = precipitationGroup.period.group // Subgroup
        expectGroupItemIds(precipitationGroupPeriod, {
            groupId: 'precipitation_era5',
            expectedIds: [precipitationMonthlyERA5LayerSource().layerId],
        })
    })

    test('does not duplicate layers when a managed layer is the same as the main layer', () => {
        const populationLayerIds = [populationTotalLayerSource().layerId]
        const populationGroup = getLayerSourceGroupping(
            populationTotalLayerSource().layerId,
            populationLayerIds
        )
        const populationGroupData = populationGroup.data.group
        expectGroupItemIds(populationGroupData, {
            groupId: 'population',
            expectedIds: [populationTotalLayerSource().layerId],
        })
        expect(populationGroup).not.toHaveProperty('period')

        const precipitationLayerIds = [
            precipitationMonthlyERA5LayerSource().layerId,
        ]
        const precipitationGroup = getLayerSourceGroupping(
            precipitationMonthlyERA5LayerSource().layerId,
            precipitationLayerIds
        )
        const precipitationGroupData = precipitationGroup.data.group // Group
        expectGroupItemIds(precipitationGroupData, {
            groupId: 'precipitation',
            expectedIds: ['precipitation_era5'],
        })
        expectGroupItemIds(precipitationGroupData.items[0], {
            groupId: 'precipitation_era5',
            expectedIds: [precipitationMonthlyERA5LayerSource().layerId],
        })
        const precipitationGroupPeriod = precipitationGroup.period.group // Subgroup
        expectGroupItemIds(precipitationGroupPeriod, {
            groupId: 'precipitation_era5',
            expectedIds: [precipitationMonthlyERA5LayerSource().layerId],
        })
    })
})
