import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
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
            onSelectLayer={jest.fn()}
            {...props}
        />
    )

const getSelect = () => screen.getByTestId('data-table-layer-selector')

describe('LayerSelectorControl', () => {
    test('lists every eligible layer by name', () => {
        renderControl()
        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
    })

    test('shows the active layer id as the selected value', () => {
        renderControl({ activeLayerId: 'layer2' })
        expect(getSelect()).toHaveValue('layer2')
    })

    test('selecting a different layer calls onSelectLayer with its id', () => {
        const onSelectLayer = jest.fn()
        renderControl({ onSelectLayer })
        fireEvent.change(getSelect(), { target: { value: 'layer2' } })
        expect(onSelectLayer).toHaveBeenCalledWith('layer2')
    })
})
