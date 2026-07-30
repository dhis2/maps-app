import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { SENTINEL_COMBINED_VALUE } from '../../../constants/dataTable.js'
import LayerSelectorControl from '../controls/LayerSelectorControl.jsx'

const layers = [
    { id: 'layer1', name: 'Layer 1' },
    { id: 'layer2', name: 'Layer 2' },
]

const renderControl = (props) =>
    render(
        <LayerSelectorControl
            layers={layers}
            activeLayerId="layer1"
            combinedView={false}
            onSelectLayer={jest.fn()}
            onSelectCombined={jest.fn()}
            {...props}
        />
    )

const getSelect = () => screen.getByTestId('data-table-layer-selector')

describe('LayerSelectorControl', () => {
    test('lists every eligible layer by name, plus a Combined option', () => {
        renderControl()
        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
        expect(screen.getByText('Combined')).toBeInTheDocument()
    })

    test("the Combined option is never disabled - selecting it before a reference is configured is the caller's job to handle", () => {
        renderControl()
        expect(screen.getByText('Combined')).not.toBeDisabled()
    })

    test('shows the active layer id as the selected value', () => {
        renderControl({ activeLayerId: 'layer2' })
        expect(getSelect()).toHaveValue('layer2')
    })

    test('shows Combined as the selected value when combinedView is true', () => {
        renderControl({ combinedView: true })
        expect(getSelect()).toHaveValue(SENTINEL_COMBINED_VALUE)
    })

    test('selecting a different layer calls onSelectLayer with its id', () => {
        const onSelectLayer = jest.fn()
        renderControl({ onSelectLayer })
        fireEvent.change(getSelect(), { target: { value: 'layer2' } })
        expect(onSelectLayer).toHaveBeenCalledWith('layer2')
    })

    test('selecting Combined calls onSelectCombined', () => {
        const onSelectCombined = jest.fn()
        renderControl({ onSelectCombined })
        fireEvent.change(getSelect(), {
            target: { value: SENTINEL_COMBINED_VALUE },
        })
        expect(onSelectCombined).toHaveBeenCalled()
    })
})
