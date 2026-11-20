import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ActiveLayerControl from '../ActiveLayerControl.jsx'

const NAME = 'ANC 1 Coverage by district, last 12 months'

// jsdom has no layout: set the sizes that tell whether the name is cut off
const setWidths = (element, { scrollWidth, offsetWidth }) => {
    Object.defineProperty(element, 'scrollWidth', { value: scrollWidth })
    Object.defineProperty(element, 'offsetWidth', { value: offsetWidth })
    element.style.lineHeight = '20px'
}

describe('ActiveLayerControl', () => {
    test('shows the layer name', () => {
        render(<ActiveLayerControl name={NAME} />)

        expect(screen.getByText(NAME)).toBeInTheDocument()
    })

    test('shows the full name on hover when the name is cut off', () => {
        render(<ActiveLayerControl name={NAME} />)
        const name = screen.getByText(NAME)
        setWidths(name, { scrollWidth: 300, offsetWidth: 120 })

        fireEvent.mouseEnter(name)
        expect(screen.getAllByText(NAME)).toHaveLength(2)

        fireEvent.mouseLeave(name)
        expect(screen.getAllByText(NAME)).toHaveLength(1)
    })

    test('shows no tooltip on hover when the whole name fits', () => {
        render(<ActiveLayerControl name={NAME} />)
        const name = screen.getByText(NAME)
        setWidths(name, { scrollWidth: 120, offsetWidth: 120 })

        fireEvent.mouseEnter(name)

        expect(screen.getAllByText(NAME)).toHaveLength(1)
    })
})
