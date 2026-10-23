import { screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { mockCachedData, renderWithCachedData } from '../../../test-utils.jsx'
import GroupSetSelect from '../GroupSetSelect.jsx'

let mockDataQueryResult

jest.mock('@dhis2/app-runtime', () => ({
    useDataQuery: () => mockDataQueryResult,
}))

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => mockCachedDataReturn,
}))

let mockCachedDataReturn

const openDropdown = async () => {
    await fireEvent.click(screen.getByTestId('dhis2-uicore-select-input'))
}

describe('GroupSetSelect', () => {
    const groupSets = [
        { id: 'gs1', name: 'Facility Type' },
        { id: 'gs2', name: 'Facility Ownership' },
    ]

    beforeEach(() => {
        mockCachedDataReturn = mockCachedData({ nameProperty: 'name' })
        mockDataQueryResult = {
            loading: false,
            error: undefined,
            data: { sets: { organisationUnitGroupSets: groupSets } },
        }
    })

    // Regression: selectValue must not default to ITEM_NONE.id ('none') when
    // allowNone is false/omitted, since that option is never added to the
    // list in that case - @dhis2/ui's Select throws if `selected` doesn't
    // match any existing option.
    it('renders without a selected option when allowNone is false and no value is given', () => {
        expect(() =>
            renderWithCachedData(<GroupSetSelect onChange={jest.fn()} />)
        ).not.toThrow()
    })

    it('renders the group sets returned by the query as options', async () => {
        renderWithCachedData(<GroupSetSelect onChange={jest.fn()} />)

        await openDropdown()

        const options = screen.getAllByTestId('dhis2-uicore-singleselectoption')
        expect(options).toHaveLength(2)
        expect(options[0]).toHaveTextContent('Facility Type')
        expect(options[1]).toHaveTextContent('Facility Ownership')
    })

    it('prepends a None option when allowNone is true', async () => {
        renderWithCachedData(
            <GroupSetSelect onChange={jest.fn()} allowNone={true} />
        )

        await openDropdown()

        const options = screen.getAllByTestId('dhis2-uicore-singleselectoption')
        expect(options).toHaveLength(3)
        expect(options[0]).toHaveTextContent('None')
    })

    it('calls onChange with undefined when None is selected', async () => {
        const onChange = jest.fn()
        renderWithCachedData(
            <GroupSetSelect
                onChange={onChange}
                allowNone={true}
                value={groupSets[0]}
            />
        )

        await openDropdown()

        const options = screen.getAllByTestId('dhis2-uicore-singleselectoption')
        await fireEvent.click(options[0])

        expect(onChange).toHaveBeenCalledWith(undefined)
    })

    it('calls onChange with the selected group set', async () => {
        const onChange = jest.fn()
        renderWithCachedData(<GroupSetSelect onChange={onChange} />)

        await openDropdown()

        const options = screen.getAllByTestId('dhis2-uicore-singleselectoption')
        await fireEvent.click(options[1])

        expect(onChange).toHaveBeenCalledWith(groupSets[1])
    })

    it('shows an error when the previously selected value is no longer in the list', () => {
        renderWithCachedData(
            <GroupSetSelect
                onChange={jest.fn()}
                value={{ id: 'stale', name: 'Stale' }}
            />
        )

        expect(
            screen.getByText(/Previously selected value not available in list/)
        ).toBeInTheDocument()
    })

    it('shows the query error message', () => {
        mockDataQueryResult = {
            loading: false,
            error: { message: 'Network error' },
            data: undefined,
        }

        renderWithCachedData(<GroupSetSelect onChange={jest.fn()} />)

        expect(screen.getByText('Network error')).toBeInTheDocument()
    })
})
