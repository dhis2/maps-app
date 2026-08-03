import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import LegendLayer from '../LegendLayer.jsx'

jest.mock('@dhis2/d2-i18n', () => ({ t: (s) => s }))
jest.mock('@dhis2/ui', () => ({
    IconView24: () => <span>eye-open</span>,
    IconViewOff24: () => <span>eye-off</span>,
}))
jest.mock('../../legend/Legend.jsx', () => () => null)
jest.mock('../../../util/legend.js', () => ({
    getRenderingLabel: () => '',
}))

const legend = { title: 'My Layer', period: '2023' }

describe('LegendLayer', () => {
    test('renders legend title and period', () => {
        render(<LegendLayer id="layer-1" legend={legend} />)
        expect(screen.getByText('My Layer')).toBeInTheDocument()
        expect(screen.getByText('2023')).toBeInTheDocument()
    })

    test('renders nothing when legend is not provided', () => {
        render(<LegendLayer id="layer-1" />)
        expect(screen.queryByText('My Layer')).not.toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    test('shows eye-open button when layer is visible', () => {
        render(
            <LegendLayer
                id="layer-1"
                legend={legend}
                isVisible={true}
                toggleLayerVisibility={jest.fn()}
            />
        )
        expect(screen.getByTitle('Hide layer')).toBeInTheDocument()
        expect(screen.getByText('eye-open')).toBeInTheDocument()
    })

    test('shows eye-off button when layer is hidden', () => {
        render(
            <LegendLayer
                id="layer-1"
                legend={legend}
                isVisible={false}
                toggleLayerVisibility={jest.fn()}
            />
        )
        expect(screen.getByTitle('Show layer')).toBeInTheDocument()
        expect(screen.getByText('eye-off')).toBeInTheDocument()
    })

    test('defaults to visible (eye-open) when isVisible is not provided', () => {
        render(
            <LegendLayer
                id="layer-1"
                legend={legend}
                toggleLayerVisibility={jest.fn()}
            />
        )
        expect(screen.getByTitle('Hide layer')).toBeInTheDocument()
    })

    test('does not render visibility button when toggleLayerVisibility is not provided', () => {
        render(<LegendLayer id="layer-1" legend={legend} isVisible={true} />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    test('calls toggleLayerVisibility with the layer id on button click', () => {
        const toggle = jest.fn()
        render(
            <LegendLayer
                id="layer-1"
                legend={legend}
                isVisible={true}
                toggleLayerVisibility={toggle}
            />
        )
        fireEvent.click(screen.getByRole('button'))
        expect(toggle).toHaveBeenCalledWith('layer-1')
        expect(toggle).toHaveBeenCalledTimes(1)
    })

    test('button click does not propagate to parent', () => {
        const toggle = jest.fn()
        const parentClick = jest.fn()
        render(
            <button onClick={parentClick}>
                <LegendLayer
                    id="layer-1"
                    legend={legend}
                    isVisible={true}
                    toggleLayerVisibility={toggle}
                />
            </button>
        )
        fireEvent.click(screen.getByTitle('Hide layer'))
        expect(parentClick).not.toHaveBeenCalled()
    })
})
