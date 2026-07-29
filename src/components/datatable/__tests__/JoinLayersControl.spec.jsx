import { render, fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import {
    EARTH_ENGINE_LAYER,
    GEOJSON_URL_LAYER,
    THEMATIC_LAYER,
} from '../../../constants/layers.js'
import JoinLayersControl from '../controls/JoinLayersControl.jsx'

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

const renderControl = (props) =>
    render(
        <JoinLayersControl
            eligibleLayers={eligibleLayers}
            layersConfig={{}}
            onChange={jest.fn()}
            {...props}
        />
    )

const openPicker = () =>
    fireEvent.click(screen.getByTestId('data-table-join-layers-button'))

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

    test('checking a layer with no org-unit identity of its own defaults to Spatial join, not Org unit', () => {
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

describe('JoinLayersControl popover — per-layer type/aggregation settings', () => {
    test('shows the join type and aggregation selects only for joined layers', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()

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

    test('does not offer the Spatial join option for a layer with no geometry sample available', () => {
        renderControl({
            layersConfig: {
                layer1: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
                layer2: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        })
        openPicker()

        expect(
            within(screen.getByLabelText('Join type for Layer 1')).queryByText(
                'Spatial'
            )
        ).not.toBeInTheDocument()
        expect(
            within(screen.getByLabelText('Join type for Layer 2')).getByText(
                'Spatial'
            )
        ).toBeInTheDocument()
    })

    test('offers Spatial for polygon geometry regardless of layer type, matched via centroid - including layers with no org-unit identity of their own', () => {
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

        expect(
            within(screen.getByLabelText('Join type for Zones')).getByText(
                'Spatial'
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

        fireEvent.change(
            screen.getByLabelText('Aggregation type for Layer 1'),
            { target: { value: 'AVERAGE' } }
        )

        expect(onChange).toHaveBeenCalledWith({
            layer1: { type: 'orgUnit', aggregation: { rawValue: 'AVERAGE' } },
        })
    })

    test('shows one labeled aggregation select per Earth Engine stat, and checking it defaults every stat to SUM', () => {
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
                aggregation: { mean: 'SUM', max: 'SUM' },
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
})
