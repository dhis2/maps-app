import { getValuesByPeriod } from '../../../../loaders/thematicLoader.js'
import { addLegendProperties } from '../../../../util/styleByDataItem.js'
import EarthEngineLayer from '../earthEngine/EarthEngineLayer.jsx'
import EventLayer from '../EventLayer.jsx'
import FacilityLayer from '../FacilityLayer.jsx'
import GeoJsonLayer from '../GeoJsonLayer.js'
import OrgUnitLayer from '../OrgUnitLayer.jsx'
import ThematicLayer from '../ThematicLayer.jsx'

jest.mock('../../MapApi.js', () => ({
    poleOfInaccessibility: jest.fn(),
    loadEarthEngineWorker: jest.fn(),
}))

const point = (id, name, value) => ({
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates: [0, 0] },
    properties: { id, name, value },
})

const DATA = [point('bo', 'Bo', 10), point('kono', 'Kono', 2)]

// Records every layer config the component gives the map
const createMap = () => {
    const configs = []
    const createMapLayer = (config) => {
        configs.push(config)
        return {
            addLayer: (child) => configs.push(child),
            setVisibility: jest.fn(),
            setIndex: jest.fn(),
            getBounds: () => null,
        }
    }

    return {
        configs,
        map: {
            createLayer: createMapLayer,
            addLayer: jest.fn(() => Promise.resolve()),
            fitBounds: jest.fn(),
            getZoom: () => 5,
            getLayersBounds: () => null,
            getMapGL: () => ({ getBearing: () => 0 }),
        },
    }
}

const drawnIds = (configs) =>
    configs
        .filter((config) => Array.isArray(config.data))
        .flatMap((config) => config.data.map((feature) => feature.id))

const createComponent = (Component, props) => {
    const { configs, map } = createMap()
    const instance = Object.create(Component.prototype)
    instance.props = {
        id: 'layer1',
        data: DATA,
        dataFilters: { name: 'bo' },
        ...props,
    }
    instance.state = {}
    instance.context = { map, isPlugin: false }
    return { instance, configs }
}

describe('table filters on the map layers', () => {
    test.each([
        ['a facility', FacilityLayer, {}],
        ['an org unit', OrgUnitLayer, {}],
        ['an event', EventLayer, {}],
        ['a thematic', ThematicLayer, {}],
        ['a GeoJSON URL', GeoJsonLayer, { featureStyle: {}, config: {} }],
    ])('%s layer draws only the rows the filters keep', (_, Layer, props) => {
        const { instance, configs } = createComponent(Layer, props)

        instance.createLayer()

        expect(drawnIds(configs)).toEqual(['bo'])
    })

    test('a timeline thematic layer filters on the values of the current period', () => {
        const { instance } = createComponent(ThematicLayer, {
            renderingStrategy: 'TIMELINE',
            externalPeriod: { id: '2024' },
            valuesByPeriod: {
                2024: { bo: { value: 1 }, kono: { value: 8 } },
            },
            noDataLegend: {},
            unclassifiedLegend: {},
            dataFilters: { value: '>5' },
        })

        const periodData = instance.buildPeriodData()

        expect(periodData.map((feature) => feature.id)).toEqual(['kono'])
    })

    test('a timeline thematic layer filters the Value column on the current period, as the table does', () => {
        const valuesByPeriod = getValuesByPeriod({
            headers: [{ name: 'pe' }, { name: 'ou' }, { name: 'value' }],
            rows: [
                ['2024', 'bo', '1'],
                ['2024', 'kono', '8'],
            ],
        })
        const { instance } = createComponent(ThematicLayer, {
            renderingStrategy: 'TIMELINE',
            externalPeriod: { id: '2024' },
            valuesByPeriod,
            noDataLegend: {},
            unclassifiedLegend: {},
            dataFilters: { rawValue: '>5' },
        })

        const periodData = instance.buildPeriodData()

        expect(periodData.map((feature) => feature.id)).toEqual(['kono'])
    })

    test('a styled event layer filters the Legend column, as the table does', () => {
        const legend = { items: [{ name: 'Low' }, { name: 'High' }] }
        const data = addLegendProperties(
            [
                { ...point('bo', 'Bo', 10), properties: { colorGroup: 1 } },
                { ...point('kono', 'Kono', 2), properties: { colorGroup: 0 } },
            ],
            legend,
            {}
        )
        const { instance, configs } = createComponent(EventLayer, {
            data,
            dataFilters: { legend: 'high' },
        })

        instance.createLayer()

        expect(drawnIds(configs)).toEqual(['bo'])
    })

    test('an Earth Engine layer masks the areas the filters leave out, without a rebuild', async () => {
        jest.spyOn(
            EarthEngineLayer.prototype,
            'createLayer'
        ).mockResolvedValue()
        const instance = new EarthEngineLayer({
            id: 'layer1',
            data: DATA,
            dataFilters: { name: 'bo' },
        })
        instance.layer = { filter: jest.fn() }
        instance.createLayer.mockClear()

        await instance.updateLayer(true)

        expect(instance.layer.filter).toHaveBeenCalledWith(['bo'])
        expect(instance.createLayer).not.toHaveBeenCalled()
    })
})
