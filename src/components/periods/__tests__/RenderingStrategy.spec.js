import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../../constants/layers.js'
import { countPeriods } from '../../../util/periods.js'
import RenderingStrategy from '../RenderingStrategy.jsx'

const mockStore = configureMockStore()

const store = mockStore({
    map: {
        mapViews: [{ id: 'layer1', renderingStrategy: 'SINGLE' }],
    },
    layerEdit: {
        filters: [],
    },
})

jest.mock('../../../util/periods', () => ({
    countPeriods: jest.fn(),
}))

jest.mock('../icons.jsx', () => ({
    IconPeriodDisplaySingle: () => <div>IconPeriodDisplaySingle</div>,
    IconPeriodDisplaySplit: () => <div>IconPeriodDisplaySplit</div>,
    IconPeriodDisplayTimeline: () => <div>IconPeriodDisplayTimeline</div>,
}))

describe('RenderingStrategy', () => {
    const layerId = 'layer1'
    const value = RENDERING_STRATEGY_SPLIT_BY_PERIOD
    const periods = []
    const mockOnChange = jest.fn()
    let props

    beforeEach(() => {
        jest.clearAllMocks()
        props = {
            layerId,
            value,
            periods,
            onChange: mockOnChange,
        }
    })

    it('renders all radio buttons with correct labels', () => {
        countPeriods.mockReturnValue(5)
        render(
            <Provider store={store}>
                <RenderingStrategy {...props} />
            </Provider>
        )

        expect(screen.getByText('Period display mode')).toBeInTheDocument()

        // Check for the number of radio buttons
        const radioButtons = screen.getAllByRole('radio')
        expect(radioButtons.length).toBe(3)

        // Check for the labels of each radio button
        expect(
            screen.getByText(
                'Show periods as a combined layer. Data is aggregated.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Show multiple periods as an interactive timeline.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Show multiple maps in view, one for each period (max 12).'
            )
        ).toBeInTheDocument()
    })

    it('calls onChange with correct value when a radio button is clicked', async () => {
        countPeriods.mockReturnValue(5)
        const onChangeMockFn = jest.fn()
        render(
            <Provider store={store}>
                <RenderingStrategy {...props} onChange={onChangeMockFn} />
            </Provider>
        )

        const radioButtons = screen.getAllByRole('radio')

        await fireEvent.click(radioButtons[1])

        expect(onChangeMockFn).toHaveBeenCalledWith(RENDERING_STRATEGY_TIMELINE)
    })
})
