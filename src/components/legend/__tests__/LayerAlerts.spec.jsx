import { act, render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import {
    LAYER_ALERT_NO_DATA,
    LAYER_ALERT_PROGRAM_UNAVAILABLE,
} from '../../../constants/layerAlerts.js'
import { createLayerAlert } from '../../../util/layerAlerts.js'
import LayerAlerts from '../LayerAlerts.jsx'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useConfig: () => ({
        serverVersion: { major: 2, minor: 43, patch: 1 },
        appVersion: { full: '101.17.5', major: 101, minor: 17 },
    }),
}))

const error = createLayerAlert(LAYER_ALERT_PROGRAM_UNAVAILABLE, {
    details: {
        httpStatusCode: 409,
        errorCode: 'E7129',
        message: 'Program not found',
    },
})
const warning = createLayerAlert(LAYER_ALERT_NO_DATA)

describe('LayerAlerts', () => {
    afterEach(() => {
        delete navigator.clipboard
        jest.useRealTimers()
    })

    it('renders nothing without alerts in this format', () => {
        const { container } = render(
            <LayerAlerts alerts={[{ code: 'WARNING_NO_DATA', message: 'x' }]} />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders errors first, with title and description', () => {
        render(<LayerAlerts alerts={[warning, error]} />)

        const alerts = screen.getAllByTestId(/^layer-alert-/)
        expect(alerts.map((alert) => alert.dataset.test)).toEqual([
            'layer-alert-error',
            'layer-alert-warning',
        ])
        expect(
            screen.getByText("This layer's program is not available")
        ).toBeInTheDocument()
        expect(screen.getByText(/may have been deleted/)).toBeInTheDocument()
    })

    it('only offers details when the alert has them', () => {
        render(<LayerAlerts alerts={[warning]} />)
        expect(screen.queryByText('Details')).not.toBeInTheDocument()
    })

    it('shows and copies the details', async () => {
        const writeText = jest.fn().mockResolvedValue()
        Object.assign(navigator, { clipboard: { writeText } })
        const onParentClick = jest.fn()

        render(
            <div onClick={onParentClick}>
                <LayerAlerts
                    alerts={[error]}
                    layerName="Malaria"
                    layerType="trackedEntity"
                />
            </div>
        )

        expect(screen.queryByText('Copy')).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('Details'))
        expect(screen.getByText('Hide details')).toHaveAttribute(
            'aria-expanded',
            'true'
        )
        const details = screen.getByTestId('layer-alert-details')
        expect(details).toHaveTextContent('E7129')
        expect(details).toHaveTextContent('Program not found')

        fireEvent.click(screen.getByText('Copy'))
        // The copy has everything an administrator needs
        const copied = writeText.mock.calls[0][0]
        expect(copied).toContain('Layer: Malaria (trackedEntity)')
        expect(copied).toContain('App version: 101.17.5')
        expect(copied).toContain('Server version: 2.43.1')
        expect(copied).toContain('Server message: Program not found')
        expect(await screen.findByText('Copied')).toBeInTheDocument()
        // The plugin legend pins on click
        expect(onParentClick).not.toHaveBeenCalled()
    })

    it('shows "Copied" for a moment only', async () => {
        jest.useFakeTimers()
        Object.assign(navigator, {
            clipboard: { writeText: jest.fn().mockResolvedValue() },
        })
        render(<LayerAlerts alerts={[error]} />)

        fireEvent.click(screen.getByText('Details'))
        fireEvent.click(screen.getByText('Copy'))
        expect(await screen.findByText('Copied')).toBeInTheDocument()

        act(() => jest.advanceTimersByTime(2000))
        expect(screen.getByText('Copy')).toBeInTheDocument()
    })

    it('offers no copy without clipboard access', () => {
        render(<LayerAlerts alerts={[error]} />)

        fireEvent.click(screen.getByText('Details'))
        expect(screen.getByTestId('layer-alert-details')).toBeInTheDocument()
        expect(screen.queryByText('Copy')).not.toBeInTheDocument()
    })
})
