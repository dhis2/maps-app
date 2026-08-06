import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { THEMATIC_LAYER } from '../../../constants/layers.js'
import LayerRow from '../controls/LayerRow.jsx'

const layer = { id: 'layer1', name: 'Layer 1', layer: THEMATIC_LAYER, data: [] }

const renderRow = (props) =>
    render(
        <LayerRow
            layer={layer}
            isExpanded={false}
            onToggleExpand={jest.fn()}
            onToggleJoined={jest.fn()}
            hasDataFilters={false}
            onClearDataFilters={jest.fn()}
            isServerClustered={false}
            onForceClientCluster={jest.fn()}
            settings={undefined}
            hasRollup={false}
            unmatchedCount={0}
            categoryDataKeys={[]}
            otherDataKeys={[]}
            onTypeChange={jest.fn()}
            onAggregationChange={jest.fn()}
            {...props}
        />
    )

describe('LayerRow — server-cluster warning', () => {
    test('shows no warning or switch button when the layer is not server clustered', () => {
        renderRow()

        expect(
            screen.queryByTestId('data-table-join-servercluster-warning-layer1')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('data-table-join-servercluster-switch-layer1')
        ).not.toBeInTheDocument()
    })

    test('shows the warning and switch button when the layer is server clustered', () => {
        renderRow({ isServerClustered: true })

        expect(
            screen.getByTestId('data-table-join-servercluster-warning-layer1')
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('data-table-join-servercluster-switch-layer1')
        ).toBeInTheDocument()
    })

    test('clicking the switch button calls onForceClientCluster', () => {
        const onForceClientCluster = jest.fn()
        renderRow({ isServerClustered: true, onForceClientCluster })

        fireEvent.click(
            screen.getByTestId('data-table-join-servercluster-switch-layer1')
        )

        expect(onForceClientCluster).toHaveBeenCalledTimes(1)
    })

    test('the warning and the data-filters warning can appear together', () => {
        renderRow({
            isServerClustered: true,
            hasDataFilters: true,
            onClearDataFilters: jest.fn(),
        })

        expect(
            screen.getByTestId('data-table-join-servercluster-warning-layer1')
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('data-table-join-datafilters-warning-layer1')
        ).toBeInTheDocument()
    })
})
