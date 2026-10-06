import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import {
    LAYER_ALERT_LOAD_FAILED,
    LAYER_ALERT_NO_DATA,
} from '../../../constants/layerAlerts.js'
import { createLayerAlert } from '../../../util/layerAlerts.js'
import LegendLayer from '../LegendLayer.jsx'

jest.mock('@dhis2/d2-i18n', () => ({ t: (s) => s }))
jest.mock('@dhis2/ui', () => ({
    IconView24: () => <span>eye-open</span>,
    IconViewOff24: () => <span>eye-off</span>,
    IconErrorFilled16: () => <span>error-icon</span>,
    IconWarningFilled16: () => <span>warning-icon</span>,
    IconInfoFilled16: () => <span>info-icon</span>,
}))
jest.mock('@dhis2/app-runtime', () => ({
    useConfig: () => ({ serverVersion: { major: 2, minor: 43 } }),
}))
jest.mock('../../legend/Legend.jsx', () => {
    const MockLegend = () => <div>legend-items</div>
    return MockLegend
})
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

    test('shows layer alerts between the title and the legend', () => {
        const { container } = render(
            <LegendLayer
                id="layer-1"
                legend={legend}
                alerts={[createLayerAlert(LAYER_ALERT_NO_DATA)]}
            />
        )
        const text = container.textContent
        expect(text.indexOf('My Layer')).toBeLessThan(
            text.indexOf('No data found')
        )
        expect(text.indexOf('No data found')).toBeLessThan(
            text.indexOf('legend-items')
        )
    })

    test('keeps the legend under an error', () => {
        render(
            <LegendLayer
                id="layer-1"
                name="My Layer"
                legend={legend}
                alerts={[createLayerAlert(LAYER_ALERT_LOAD_FAILED)]}
            />
        )
        expect(screen.getByText('Failed to load layer')).toBeInTheDocument()
        expect(screen.getByText('legend-items')).toBeInTheDocument()
    })
})
