import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Legend from '../Legend.jsx'

jest.mock('@dhis2/d2-i18n', () => ({ t: (s) => s }))
jest.mock('../LegendLayer.jsx', () => () => null)

const layers = [{ id: 'layer-1', legend: { title: 'My Layer' } }]

describe('Legend', () => {
    test('renders closed and unpinned by default', () => {
        const { container } = render(<Legend layers={layers} />)

        expect(screen.getByTitle('Legend')).toBeInTheDocument()
        expect(container.firstChild.className).not.toMatch('pinned')
    })

    test('opens and pins automatically when entering fullscreen', () => {
        const { rerender, container } = render(
            <Legend layers={layers} isFullscreen={false} />
        )

        rerender(<Legend layers={layers} isFullscreen={true} />)

        expect(screen.getByTitle('Click to unpin legend')).toBeInTheDocument()
        expect(container.firstChild.className).toMatch('pinned')
    })

    test('closes and unpins automatically when exiting fullscreen', () => {
        const { rerender, container } = render(
            <Legend layers={layers} isFullscreen={true} />
        )

        rerender(<Legend layers={layers} isFullscreen={false} />)

        expect(screen.getByTitle('Legend')).toBeInTheDocument()
        expect(container.firstChild.className).not.toMatch('pinned')
    })

    test('user can manually unpin while still in fullscreen', () => {
        const { container } = render(
            <Legend layers={layers} isFullscreen={true} />
        )

        fireEvent.click(container.querySelector('.dhis2-map-legend-content'))

        expect(screen.getByTitle('Click to pin legend')).toBeInTheDocument()
        expect(container.firstChild.className).not.toMatch('pinned')
    })

    test('manually unpinned legend closes on mouse leave', () => {
        const { container } = render(
            <Legend layers={layers} isFullscreen={true} />
        )

        fireEvent.click(container.querySelector('.dhis2-map-legend-content'))
        fireEvent.mouseLeave(
            container.querySelector('.dhis2-map-legend-content')
        )

        expect(screen.getByTitle('Legend')).toBeInTheDocument()
    })

    test('pinned legend stays open on mouse leave', () => {
        const { container } = render(
            <Legend layers={layers} isFullscreen={true} />
        )

        fireEvent.mouseLeave(
            container.querySelector('.dhis2-map-legend-content')
        )

        expect(screen.getByTitle('Click to unpin legend')).toBeInTheDocument()
    })
})
