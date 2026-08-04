import { render, fireEvent, screen, within } from '@testing-library/react'
import PropTypes from 'prop-types'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    EARTH_ENGINE_LAYER,
    EVENT_LAYER,
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
    THEMATIC_LAYER,
} from '../../../constants/layers.js'
import JoinLayersControl from '../controls/JoinLayersControl.jsx'

const mockStore = configureMockStore()

const eligibleLayers = [
    {
        id: 'layer1',
        name: 'Layer 1',
        combinedLayerKey: 'layer1',
        layer: THEMATIC_LAYER,
        data: [],
    },
    {
        id: 'layer2',
        name: 'Layer 2',
        combinedLayerKey: 'layer2',
        layer: THEMATIC_LAYER,
        data: [
            {
                properties: { orgUnitPath: '/country1/ou1' },
                geometry: { type: 'Point' },
            },
        ],
    },
]

const renderControl = (props) => {
    const store = mockStore({})
    return {
        store,
        ...render(
            <Provider store={store}>
                <JoinLayersControl
                    eligibleLayers={eligibleLayers}
                    layersConfig={{}}
                    onChange={jest.fn()}
                    {...props}
                />
            </Provider>
        ),
    }
}

const openPicker = () =>
    fireEvent.click(screen.getByTestId('data-table-join-layers-button'))

const expandLayer = (layerId) =>
    fireEvent.click(
        screen.getByTestId(`data-table-join-layer-toggle-${layerId}`)
    )

const StatefulJoinLayersControl = ({
    layersConfig: initialConfig,
    ...props
}) => {
    const [layersConfig, setLayersConfig] = React.useState(initialConfig ?? {})
    return (
        <JoinLayersControl
            eligibleLayers={eligibleLayers}
            {...props}
            layersConfig={layersConfig}
            onChange={setLayersConfig}
        />
    )
}

StatefulJoinLayersControl.propTypes = {
    layersConfig: PropTypes.object,
}

const renderStatefulControl = (props) => {
    const store = mockStore({})
    return {
        store,
        ...render(
            <Provider store={store}>
                <StatefulJoinLayersControl {...props} />
            </Provider>
        ),
    }
}

describe('JoinLayersControl trigger', () => {
    test('is disabled when there are no eligible layers', () => {
        renderControl({ eligibleLayers: [] })
        expect(
            screen.getByTestId('data-table-join-layers-button')
        ).toBeDisabled()
    })

    test('is enabled once eligible layers are available', () => {
        renderControl()
        expect(
            screen.getByTestId('data-table-join-layers-button')
        ).not.toBeDisabled()
    })
})

describe('JoinLayersControl popover — checkbox list', () => {
    test('lists a checkbox per eligible layer', () => {
        renderControl()
        openPicker()

        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
    })

    test('reflects the currently joined layers as checked', () => {
        renderControl({
            layersConfig: {
                layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()

        expect(
            screen.getByRole('checkbox', { name: 'Layer 1' })
        ).not.toBeChecked()
        expect(screen.getByRole('checkbox', { name: 'Layer 2' })).toBeChecked()
    })

    test('checking an unselected layer adds it with default org-unit/SUM settings', () => {
        const onChange = jest.fn()
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
            onChange,
        })
        openPicker()

        fireEvent.click(screen.getByRole('checkbox', { name: 'Layer 2' }))

        expect(onChange).toHaveBeenCalledWith({
            layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
        })
    })

    test("checking a layer defaults its aggregation to the data item's own aggregation type, not SUM", () => {
        const onChange = jest.fn()
        renderControl({
            eligibleLayers: [
                {
                    id: 'layer3',
                    name: 'Layer 3',
                    combinedLayerKey: 'layer3',
                    layer: THEMATIC_LAYER,
                    data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
                    columns: [
                        {
                            dimension: 'dx',
                            items: [
                                {
                                    id: 'de1',
                                    name: 'DE 1',
                                    aggregationType: 'AVERAGE',
                                },
                            ],
                        },
                    ],
                },
            ],
            layersConfig: {},
            onChange,
        })
        openPicker()

        fireEvent.click(screen.getByRole('checkbox', { name: 'Layer 3' }))

        expect(onChange).toHaveBeenCalledWith({
            layer3: {
                type: 'orgUnit',
                aggregation: { rawValue: 'AVERAGE' },
            },
        })
    })

    test('checking a layer with no org-unit identity of its own defaults to Location join, not Org unit', () => {
        const onChange = jest.fn()
        renderControl({
            eligibleLayers: [
                {
                    id: 'geo',
                    name: 'Zones',
                    combinedLayerKey: 'geo',
                    layer: GEOJSON_URL_LAYER,
                    data: [{ geometry: { type: 'Point' } }],
                },
            ],
            layersConfig: {},
            onChange,
        })
        openPicker()

        fireEvent.click(screen.getByRole('checkbox', { name: 'Zones' }))

        expect(onChange).toHaveBeenCalledWith({
            geo: { type: 'spatial', aggregation: { rawValue: 'SUM' } },
        })
    })

    test('unchecking a joined layer removes it from the config', () => {
        const onChange = jest.fn()
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
                layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
            onChange,
        })
        openPicker()

        fireEvent.click(screen.getByRole('checkbox', { name: 'Layer 1' }))

        expect(onChange).toHaveBeenCalledWith({
            layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
        })
    })
})

describe('JoinLayersControl popover — collapsible layer settings', () => {
    test('an unjoined layer has no expand/collapse toggle', () => {
        renderControl()
        openPicker()

        expect(
            screen.queryByTestId('data-table-join-layer-toggle-layer1')
        ).not.toBeInTheDocument()
    })

    test('a joined layer is collapsed by default when the popover is opened, hiding its settings', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()

        expect(
            screen.getByTestId('data-table-join-layer-toggle-layer1')
        ).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Join type for Layer 1')
        ).not.toBeInTheDocument()
    })

    test('checking a previously unjoined layer expands its settings automatically', () => {
        renderStatefulControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()

        fireEvent.click(screen.getByRole('checkbox', { name: 'Layer 2' }))

        expect(
            screen.getByLabelText('Join type for Layer 2')
        ).toBeInTheDocument()
    })

    test('expanding a collapsed layer shows its settings', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()

        expandLayer('layer1')

        expect(
            screen.getByLabelText('Join type for Layer 1')
        ).toBeInTheDocument()
    })

    test('collapsing an expanded layer hides its settings again, without changing layersConfig', () => {
        const onChange = jest.fn()
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
            onChange,
        })
        openPicker()

        expandLayer('layer1')
        expandLayer('layer1')

        expect(
            screen.queryByLabelText('Join type for Layer 1')
        ).not.toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: 'Layer 1' })).toBeChecked()
        expect(onChange).not.toHaveBeenCalled()
    })

    test('expanding one layer does not affect another joined layer', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
                layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()

        expandLayer('layer1')

        expect(
            screen.getByLabelText('Join type for Layer 1')
        ).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Join type for Layer 2')
        ).not.toBeInTheDocument()
    })
})

describe('JoinLayersControl popover — per-layer type/aggregation settings', () => {
    test('shows the join type and aggregation selects only for joined layers', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(
            screen.getByLabelText('Join type for Layer 1')
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText('Aggregation type for Layer 1')
        ).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Join type for Layer 2')
        ).not.toBeInTheDocument()
    })

    test('does not offer the Location join option for a layer with no geometry sample available', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
                layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('layer1')
        expandLayer('layer2')

        expect(
            within(screen.getByLabelText('Join type for Layer 1')).queryByText(
                'Location'
            )
        ).not.toBeInTheDocument()
        expect(
            within(screen.getByLabelText('Join type for Layer 2')).getByText(
                'Location'
            )
        ).toBeInTheDocument()
    })

    test('offers Location for polygon geometry regardless of layer type, matched via centroid - including layers with no org-unit identity of their own', () => {
        renderControl({
            eligibleLayers: [
                {
                    id: 'geo',
                    name: 'Zones',
                    combinedLayerKey: 'geo',
                    layer: GEOJSON_URL_LAYER,
                    data: [{ geometry: { type: 'Polygon' } }],
                },
            ],
            layersConfig: {
                geo: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('geo')

        expect(
            within(screen.getByLabelText('Join type for Zones')).getByText(
                'Location'
            )
        ).toBeInTheDocument()
    })

    test('changing the join type dispatches onChange with the updated type', () => {
        const onChange = jest.fn()
        renderControl({
            layersConfig: {
                layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
            onChange,
        })
        openPicker()
        expandLayer('layer2')

        fireEvent.change(screen.getByLabelText('Join type for Layer 2'), {
            target: { value: 'spatial' },
        })

        expect(onChange).toHaveBeenCalledWith({
            layer2: { type: 'spatial', aggregation: { rawValue: 'SUM' } },
        })
    })

    test('changing the aggregation type dispatches onChange with the updated aggregation for that column', () => {
        const onChange = jest.fn()
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
            onChange,
        })
        openPicker()
        expandLayer('layer1')

        fireEvent.change(
            screen.getByLabelText('Aggregation type for Layer 1'),
            { target: { value: 'AVERAGE' } }
        )

        expect(onChange).toHaveBeenCalledWith({
            layer1: { type: 'orgUnit', aggregation: { rawValue: 'AVERAGE' } },
        })
    })

    test("shows one labeled aggregation select per Earth Engine stat, and checking it defaults every stat to the first selected stat's own equivalent", () => {
        const onChange = jest.fn()
        const eeLayer = {
            id: 'ee',
            name: 'NDVI',
            combinedLayerKey: 'ee',
            layer: EARTH_ENGINE_LAYER,
            aggregationType: ['mean', 'max'],
            legend: { title: 'NDVI' },
            data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
        }
        renderControl({
            eligibleLayers: [eeLayer],
            layersConfig: {},
            onChange,
        })
        openPicker()

        fireEvent.click(screen.getByRole('checkbox', { name: 'NDVI' }))

        expect(onChange).toHaveBeenCalledWith({
            ee: {
                type: 'orgUnit',
                aggregation: { mean: 'AVERAGE', max: 'AVERAGE' },
            },
        })
    })

    test('changing one Earth Engine stat column aggregation leaves the other stat column untouched', () => {
        const onChange = jest.fn()
        const eeLayer = {
            id: 'ee',
            name: 'NDVI',
            combinedLayerKey: 'ee',
            layer: EARTH_ENGINE_LAYER,
            aggregationType: ['mean', 'max'],
            legend: { title: 'NDVI' },
            data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
        }
        renderControl({
            eligibleLayers: [eeLayer],
            layersConfig: {
                ee: {
                    type: 'orgUnit',
                    aggregation: { mean: 'SUM', max: 'SUM' },
                },
            },
            onChange,
        })
        openPicker()
        expandLayer('ee')

        expect(
            screen.getByLabelText('Aggregation type for Mean Ndvi (NDVI)')
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText('Aggregation type for Max Ndvi (NDVI)')
        ).toBeInTheDocument()

        fireEvent.change(
            screen.getByLabelText('Aggregation type for Mean Ndvi (NDVI)'),
            { target: { value: 'AVERAGE' } }
        )

        expect(onChange).toHaveBeenCalledWith({
            ee: {
                type: 'orgUnit',
                aggregation: { mean: 'AVERAGE', max: 'SUM' },
            },
        })
    })

    test('shows a single shared aggregation select for a multi-period thematic layer, not one per period', () => {
        const onChange = jest.fn()
        const timelineLayer = {
            id: 'timeline',
            name: 'Timeline Layer',
            combinedLayerKey: 'timeline',
            layer: THEMATIC_LAYER,
            renderingStrategy: 'TIMELINE',
            periods: [
                { id: 'p1', name: 'Jan' },
                { id: 'p2', name: 'Feb' },
                { id: 'p3', name: 'Mar' },
            ],
            data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
        }
        renderControl({
            eligibleLayers: [timelineLayer],
            layersConfig: {
                timeline: { type: 'orgUnit', aggregation: {} },
            },
            onChange,
        })
        openPicker()
        expandLayer('timeline')

        expect(
            screen.getAllByLabelText('Aggregation type for Timeline Layer')
        ).toHaveLength(1)

        fireEvent.change(
            screen.getByLabelText('Aggregation type for Timeline Layer'),
            { target: { value: 'AVERAGE' } }
        )

        expect(onChange).toHaveBeenCalledWith({
            timeline: {
                type: 'orgUnit',
                aggregation: { rawValue: 'AVERAGE' },
            },
        })
    })
})

describe('JoinLayersControl popover — aggregation rollup warning', () => {
    const referenceLayer = {
        data: [
            {
                properties: {
                    id: 'ref1',
                    name: 'Ref 1',
                    orgUnitPath: '/country1/ref1',
                    level: 2,
                },
            },
        ],
    }

    const rollupLayer = {
        id: 'layer1',
        name: 'Layer 1',
        combinedLayerKey: 'layer1',
        layer: THEMATIC_LAYER,
        data: [
            { properties: { orgUnitPath: '/country1/ref1/child1' } },
            { properties: { orgUnitPath: '/country1/ref1/child2' } },
        ],
    }

    const noRollupLayer = {
        id: 'layer1',
        name: 'Layer 1',
        combinedLayerKey: 'layer1',
        layer: THEMATIC_LAYER,
        data: [{ properties: { orgUnitPath: '/country1/ref1' } }],
    }

    const getWarning = () =>
        screen.queryByTestId(
            'data-table-join-aggregation-warning-layer1-rawValue'
        )

    test('shows a warning when the layer rolls up into the reference and the aggregation is non-composable (AVERAGE)', () => {
        renderControl({
            eligibleLayers: [rollupLayer],
            referenceLayer,
            layersConfig: {
                layer1: {
                    type: 'orgUnit',
                    aggregation: { rawValue: 'AVERAGE' },
                },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(getWarning()).toBeInTheDocument()
    })

    test('does not show a warning for an Event layer, even when it rolls up and the aggregation is non-composable (AVERAGE) - event values are raw individual records, not an average-of-averages approximation', () => {
        const rollupEventLayer = {
            id: 'layer1',
            name: 'Layer 1',
            combinedLayerKey: 'layer1',
            layer: EVENT_LAYER,
            styleDataItem: { id: 'de1', valueType: 'NUMBER' },
            legend: { items: [{ name: 'Low' }, { name: 'High' }] },
            data: [
                { properties: { orgUnitPath: '/country1/ref1/child1' } },
                { properties: { orgUnitPath: '/country1/ref1/child2' } },
            ],
        }
        renderControl({
            eligibleLayers: [rollupEventLayer],
            referenceLayer,
            layersConfig: {
                layer1: {
                    type: 'orgUnit',
                    aggregation: { value: 'AVERAGE' },
                },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(
            screen.queryByTestId(
                'data-table-join-aggregation-warning-layer1-value'
            )
        ).not.toBeInTheDocument()
    })

    test('does not show a warning when the layer rolls up but the aggregation is composable (SUM)', () => {
        renderControl({
            eligibleLayers: [rollupLayer],
            referenceLayer,
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(getWarning()).not.toBeInTheDocument()
    })

    test('does not show a warning when the aggregation is non-composable but every reference org unit matches at most one feature', () => {
        renderControl({
            eligibleLayers: [noRollupLayer],
            referenceLayer,
            layersConfig: {
                layer1: {
                    type: 'orgUnit',
                    aggregation: { rawValue: 'AVERAGE' },
                },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(getWarning()).not.toBeInTheDocument()
    })

    test('does not show a warning when no reference layer is available yet', () => {
        renderControl({
            eligibleLayers: [rollupLayer],
            referenceLayer: undefined,
            layersConfig: {
                layer1: {
                    type: 'orgUnit',
                    aggregation: { rawValue: 'AVERAGE' },
                },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(getWarning()).not.toBeInTheDocument()
    })
})

describe('JoinLayersControl popover — unmatched features warning', () => {
    const referenceLayer = {
        data: [
            {
                properties: {
                    id: 'ref1',
                    name: 'Ref 1',
                    orgUnitPath: '/country1/ref1',
                    level: 2,
                },
            },
        ],
    }

    const getWarning = () =>
        screen.queryByTestId('data-table-join-unmatched-warning-layer1')

    test('shows a warning when some of the layer features could not be matched to any reference org unit', () => {
        renderControl({
            eligibleLayers: [
                {
                    id: 'layer1',
                    name: 'Layer 1',
                    combinedLayerKey: 'layer1',
                    layer: THEMATIC_LAYER,
                    data: [
                        { properties: { orgUnitPath: '/country1/ref1' } },
                        { properties: { orgUnitPath: '/country2/other' } },
                    ],
                },
            ],
            referenceLayer,
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(getWarning()).toBeInTheDocument()
    })

    test('does not show a warning when every layer feature matches a reference org unit', () => {
        renderControl({
            eligibleLayers: [
                {
                    id: 'layer1',
                    name: 'Layer 1',
                    combinedLayerKey: 'layer1',
                    layer: THEMATIC_LAYER,
                    data: [{ properties: { orgUnitPath: '/country1/ref1' } }],
                },
            ],
            referenceLayer,
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(getWarning()).not.toBeInTheDocument()
    })

    test('does not show a warning when no reference layer is available yet', () => {
        renderControl({
            eligibleLayers: [
                {
                    id: 'layer1',
                    name: 'Layer 1',
                    combinedLayerKey: 'layer1',
                    layer: THEMATIC_LAYER,
                    data: [{ properties: { orgUnitPath: '/country2/other' } }],
                },
            ],
            referenceLayer: undefined,
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('layer1')

        expect(getWarning()).not.toBeInTheDocument()
    })
})

describe('JoinLayersControl popover — count/category value columns', () => {
    const countOnlyFacility = {
        id: 'facility1',
        name: 'Facilities',
        combinedLayerKey: 'facility1',
        layer: FACILITY_LAYER,
        legend: { items: [{ name: 'Facility' }] },
        data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
    }

    const categoricalFacility = {
        id: 'facility1',
        name: 'Facilities',
        combinedLayerKey: 'facility1',
        layer: FACILITY_LAYER,
        organisationUnitGroupSet: { id: 'groupSet1' },
        legend: {
            unit: 'Facility Type',
            items: [
                { id: 'group1', name: 'Hospital' },
                { id: 'group2', name: 'Clinic' },
            ],
        },
        data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
    }

    test('a count-only layer shows a static, layer-type-specific count label, not an aggregation-type select', () => {
        renderControl({
            eligibleLayers: [countOnlyFacility],
            layersConfig: {
                facility1: {
                    type: 'orgUnit',
                    aggregation: { count: 'COUNT' },
                },
            },
        })
        openPicker()
        expandLayer('facility1')

        expect(screen.getByText('Facilities count')).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Aggregation type for Facilities')
        ).not.toBeInTheDocument()
    })

    test('a category layer shows a single shared Count/Percentage select governing every category column, not one per category', () => {
        const onChange = jest.fn()
        renderControl({
            eligibleLayers: [categoricalFacility],
            layersConfig: {
                facility1: {
                    type: 'orgUnit',
                    aggregation: { categoryDisplayType: 'COUNT' },
                },
            },
            onChange,
        })
        openPicker()
        expandLayer('facility1')

        expect(
            screen.queryByLabelText(
                'Aggregation type for Hospital (Facilities)'
            )
        ).not.toBeInTheDocument()
        expect(screen.getByText('Facility Type')).toBeInTheDocument()

        const categorySelect = screen.getByLabelText(
            'Category display for Facilities'
        )
        expect(
            within(categorySelect).getByText('Percentage')
        ).toBeInTheDocument()
        expect(within(categorySelect).getByText('Count')).toBeInTheDocument()

        fireEvent.change(categorySelect, { target: { value: 'PERCENTAGE' } })

        expect(onChange).toHaveBeenCalledWith({
            facility1: {
                type: 'orgUnit',
                aggregation: { categoryDisplayType: 'PERCENTAGE' },
            },
        })
    })

    test('falls back to a generic "Categories" label when the layer has no legend.unit', () => {
        renderControl({
            eligibleLayers: [
                {
                    ...categoricalFacility,
                    legend: { items: categoricalFacility.legend.items },
                },
            ],
            layersConfig: {
                facility1: { type: 'orgUnit', aggregation: {} },
            },
        })
        openPicker()
        expandLayer('facility1')

        expect(screen.getByText('Categories')).toBeInTheDocument()
    })

    test('a value-kind layer (Thematic/Earth Engine) is unaffected - keeps the full aggregation-type select', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()
        expandLayer('layer1')

        const select = screen.getByLabelText('Aggregation type for Layer 1')
        expect(within(select).getByText('Average')).toBeInTheDocument()
        expect(within(select).getByText('Sum')).toBeInTheDocument()
        expect(within(select).queryByText('Percentage')).not.toBeInTheDocument()
    })
})

describe('JoinLayersControl dataFilters warning', () => {
    test('shows no warning or clear button for a layer with no active dataFilters', () => {
        renderControl()
        openPicker()

        expect(
            screen.queryByTestId('data-table-join-datafilters-warning-layer1')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('data-table-join-clear-datafilters-layer1')
        ).not.toBeInTheDocument()
    })

    test('shows the warning and clear button for a layer with active dataFilters, even when not joined', () => {
        renderControl({
            eligibleLayers: [
                { ...eligibleLayers[0], dataFilters: { population: '>100' } },
                eligibleLayers[1],
            ],
        })
        openPicker()

        expect(
            screen.getByTestId('data-table-join-datafilters-warning-layer1')
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('data-table-join-clear-datafilters-layer1')
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('data-table-join-datafilters-warning-layer2')
        ).not.toBeInTheDocument()
    })

    test('clicking the clear button dispatches clearDataFilters for that layer', () => {
        const { store } = renderControl({
            eligibleLayers: [
                { ...eligibleLayers[0], dataFilters: { population: '>100' } },
                eligibleLayers[1],
            ],
        })
        openPicker()

        fireEvent.click(
            screen.getByTestId('data-table-join-clear-datafilters-layer1')
        )

        expect(store.getActions()).toContainEqual({
            type: 'DATA_FILTERS_CLEAR_ALL',
            layerId: 'layer1',
        })
    })
})
