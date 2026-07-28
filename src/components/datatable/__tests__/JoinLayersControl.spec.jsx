import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import JoinLayersControl from '../controls/JoinLayersControl.jsx'

const eligibleLayers = [
    { id: 'layer1', name: 'Layer 1' },
    { id: 'layer2', name: 'Layer 2' },
]

const renderControl = (props) =>
    render(
        <JoinLayersControl
            eligibleLayers={eligibleLayers}
            selectedIds={[]}
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

describe('JoinLayersControl popover', () => {
    test('lists a checkbox per eligible layer', () => {
        renderControl()
        openPicker()

        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
    })

    test('reflects the currently selected layer ids as checked', () => {
        renderControl({ selectedIds: ['layer2'] })
        openPicker()

        expect(
            screen.getByText('Layer 1').closest('label').querySelector('input')
        ).not.toBeChecked()
        expect(
            screen.getByText('Layer 2').closest('label').querySelector('input')
        ).toBeChecked()
    })

    test('checking an unselected layer adds it to the selection', () => {
        const onChange = jest.fn()
        renderControl({ selectedIds: ['layer1'], onChange })
        openPicker()

        fireEvent.click(
            screen.getByText('Layer 2').closest('label').querySelector('input')
        )

        expect(onChange).toHaveBeenCalledWith(['layer1', 'layer2'])
    })

    test('unchecking a selected layer removes it from the selection', () => {
        const onChange = jest.fn()
        renderControl({ selectedIds: ['layer1', 'layer2'], onChange })
        openPicker()

        fireEvent.click(
            screen.getByText('Layer 1').closest('label').querySelector('input')
        )

        expect(onChange).toHaveBeenCalledWith(['layer2'])
    })
})
