import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import CoordinateField from '../CoordinateField.jsx'

const mockUseConfig = jest.fn()
jest.mock('@dhis2/app-runtime', () => ({
    useConfig: (...args) => mockUseConfig(...args),
}))

const mockUseEventDataItems = jest.fn()
jest.mock('../EventDataItemsProvider.jsx', () => ({
    useEventDataItems: (...args) => mockUseEventDataItems(...args),
}))

const ouTypeItem = {
    id: 'ouFieldId1',
    name: 'OU Field',
    valueType: 'ORGANISATION_UNIT',
}

// OU-type fallback (2.44+) is a separate, later gate than OU-type main fields (2.42+).
describe('CoordinateField', () => {
    beforeEach(() => {
        mockUseEventDataItems.mockReturnValue({
            eventDataItems: [ouTypeItem],
            trackedEntityType: null,
            loading: false,
        })
    })

    it('includes ORGANISATION_UNIT in the main field type filter regardless of version', () => {
        mockUseConfig.mockReturnValue({ serverVersion: { minor: 43 } })

        render(
            <CoordinateField value={null} onChange={jest.fn()} program={{}} />
        )

        expect(mockUseEventDataItems).toHaveBeenCalledWith({
            includeTypes: ['COORDINATE', 'ORGANISATION_UNIT'],
        })
    })

    it('excludes ORGANISATION_UNIT from the fallback field type filter pre-2.44', () => {
        mockUseConfig.mockReturnValue({ serverVersion: { minor: 43 } })

        render(
            <CoordinateField
                value={null}
                onChange={jest.fn()}
                program={{}}
                eventCoordinateField="psigeometry"
            />
        )

        expect(mockUseEventDataItems).toHaveBeenCalledWith({
            includeTypes: ['COORDINATE'],
        })
    })

    it('includes ORGANISATION_UNIT in the fallback field type filter on 2.44+', () => {
        mockUseConfig.mockReturnValue({ serverVersion: { minor: 44 } })

        render(
            <CoordinateField
                value={null}
                onChange={jest.fn()}
                program={{}}
                eventCoordinateField="psigeometry"
            />
        )

        expect(mockUseEventDataItems).toHaveBeenCalledWith({
            includeTypes: ['COORDINATE', 'ORGANISATION_UNIT'],
        })
    })

    it('renders the OU-type field as a selectable option when included', async () => {
        mockUseConfig.mockReturnValue({ serverVersion: { minor: 44 } })
        // Custom items only appear once a tracked entity type exists.
        mockUseEventDataItems.mockReturnValue({
            eventDataItems: [ouTypeItem],
            trackedEntityType: { id: 'tet1' },
            loading: false,
        })

        render(
            <CoordinateField value={null} onChange={jest.fn()} program={{}} />
        )

        fireEvent.click(screen.getByTestId('dhis2-uicore-select-input'))

        const labels = screen
            .getAllByTestId('dhis2-uicore-singleselectoption')
            .map((el) => el.textContent)
        expect(labels).toContain('OU Field')
    })

    it('shows the org-unit-only cascade help text for a program without registration', () => {
        mockUseConfig.mockReturnValue({ serverVersion: { minor: 44 } })
        // trackedEntityType resolves to {} (not null) for WITHOUT_REGISTRATION programs.
        mockUseEventDataItems.mockReturnValue({
            eventDataItems: [ouTypeItem],
            trackedEntityType: {},
            loading: false,
        })

        render(
            <CoordinateField
                value="cascading"
                onChange={jest.fn()}
                program={{}}
                eventCoordinateField="psigeometry"
            />
        )

        expect(screen.getByText('Event > org unit coordinate')).toBeTruthy()
        expect(
            screen.queryByText(
                'Event > enrollment > tracked entity > org unit coordinate'
            )
        ).toBeNull()
    })
})
