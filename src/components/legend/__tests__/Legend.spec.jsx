import { render, screen } from '@testing-library/react'
import React from 'react'
import Legend from '../Legend.jsx'

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: jest.fn(() => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'NONE' },
    })),
}))

describe('Legend coordinate field / fallback display', () => {
    it('shows only the coordinate field when there is no fallback', () => {
        render(<Legend coordinateFields={['Event location']} />)

        expect(screen.getByText('Event location')).toBeTruthy()
        expect(screen.queryByText(/fallback/)).toBeNull()
    })

    it('shows the fallback alongside the coordinate field when set', () => {
        render(
            <Legend
                coordinateFields={['Event location']}
                fallbackCoordinateField="Organisation unit location"
            />
        )

        expect(
            screen.getByText(
                'Event location (fallback: Organisation unit location)'
            )
        ).toBeTruthy()
    })
})
