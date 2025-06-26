import { getNowInCalendar } from '@dhis2/multi-calendar-dates'
import { getDefaultDatesInCalendar } from '../date.js'

jest.mock('@dhis2/multi-calendar-dates', () => ({
    getNowInCalendar: jest.fn(),
}))

describe('getDefaultDatesInCalendar', () => {
    it('should calculate correct startDate and endDate', () => {
        getNowInCalendar.mockReturnValue({
            day: 15,
            month: 7,
            eraYear: 2024,
        })

        const result = getDefaultDatesInCalendar()
        expect(result.startDate).toBe('2023-07-15') // One year before
        expect(result.endDate).toBe('2024-07-15') // Current year
    })
})
