import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { VirtuosoMockContext } from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_SET,
    DATA_FILTER_CLEAR,
} from '../../../constants/actionTypes.js'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    ORG_UNIT_GROUPS_GRANULARITY,
} from '../../../constants/dataTable.js'
import OrgUnitGroupFilterInput from '../OrgUnitGroupFilterInput.jsx'

const mockStore = configureMockStore()

const ORG_UNIT_VALUES = [
    { value: '/country1/region1/facility1' },
    { value: '/country1/region2/facility2' },
    { value: '/country2/facility3' },
]

const renderOrgUnitGroupFilter = (props) => {
    const store = mockStore({})
    const result = render(
        <Provider store={store}>
            <VirtuosoMockContext.Provider
                value={{ viewportHeight: 300, itemHeight: 28 }}
            >
                <OrgUnitGroupFilterInput
                    dataKey="orgUnitPath"
                    name="Org unit"
                    layerId="layer1"
                    options={ORG_UNIT_VALUES}
                    idToName={new Map()}
                    {...props}
                />
            </VirtuosoMockContext.Provider>
        </Provider>
    )
    return { ...result, store }
}

const getInput = () =>
    screen
        .getByTestId('data-table-column-filter-search-Org unit')
        .querySelector('input')

const openPopover = () => fireEvent.focus(getInput())

describe('OrgUnitGroupFilterInput - default (collapsed) tree', () => {
    test('shows only root nodes by default', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        expect(screen.getByLabelText('country1')).toBeInTheDocument()
        expect(screen.getByLabelText('country2')).toBeInTheDocument()
        expect(screen.queryByLabelText('region1')).not.toBeInTheDocument()
    })

    test('expanding a root node reveals its children', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand country1'))
        expect(screen.getByLabelText('region1')).toBeInTheDocument()
        expect(screen.getByLabelText('region2')).toBeInTheDocument()
    })

    test('an org unit id is naturally a leaf - no separate terminal node beneath it', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand country2'))
        expect(screen.getByLabelText('facility3')).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Expand facility3')
        ).not.toBeInTheDocument()
    })

    test('collapsing a root node hides its children again', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand country1'))
        expect(screen.getByLabelText('region1')).toBeInTheDocument()
        fireEvent.click(screen.getByLabelText('Collapse country1'))
        expect(screen.queryByLabelText('region1')).not.toBeInTheDocument()
    })
})

describe('OrgUnitGroupFilterInput - label resolution', () => {
    test('shows the raw id as a placeholder label until the name resolves', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        expect(screen.getByLabelText('country1')).toBeInTheDocument()
    })

    test('shows the resolved name once idToName has it', () => {
        renderOrgUnitGroupFilter({
            idToName: new Map([['country1', 'Sierra Leone']]),
        })
        openPopover()
        expect(screen.getByLabelText('Sierra Leone')).toBeInTheDocument()
        expect(screen.queryByLabelText('country1')).not.toBeInTheDocument()
    })
})

describe('OrgUnitGroupFilterInput - selection dispatches', () => {
    test('checking a root node dispatches the full org-unit-group filter shape', () => {
        const { store } = renderOrgUnitGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('country1'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'orgUnitPath',
            filter: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
            },
        })
    })

    test('unchecking the only selected prefix dispatches DATA_FILTER_CLEAR', () => {
        const { store } = renderOrgUnitGroupFilter({
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('country1'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'orgUnitPath',
        })
    })
})

describe('OrgUnitGroupFilterInput - tri-state checkbox rendering', () => {
    test('a root node is checked when its own prefix is selected', () => {
        renderOrgUnitGroupFilter({
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
            },
        })
        openPopover()
        expect(screen.getByLabelText('country1')).toBeChecked()
    })

    test('a root node is indeterminate when only a descendant prefix is selected', () => {
        renderOrgUnitGroupFilter({
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1/region1'],
            },
        })
        openPopover()
        const countryCheckbox = screen.getByLabelText('country1')
        expect(countryCheckbox.indeterminate).toBe(true)
        expect(countryCheckbox.checked).toBe(false)
    })

    test('a descendant is checked (not indeterminate) when its ancestor is selected', () => {
        renderOrgUnitGroupFilter({
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand country1'))
        const regionCheckbox = screen.getByLabelText('region1')
        expect(regionCheckbox.checked).toBe(true)
        expect(regionCheckbox.indeterminate).toBe(false)
    })
})

describe('OrgUnitGroupFilterInput - "Any value" / "No value"', () => {
    test('"No value" is only shown when the options include the not-set sentinel', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        expect(screen.queryByLabelText('No value')).not.toBeInTheDocument()
    })

    test('checking "Any value" dispatches the sentinel and clears prior selections', () => {
        const { store } = renderOrgUnitGroupFilter({
            options: [...ORG_UNIT_VALUES, { value: SENTINEL_NO_VALUE }],
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('Any value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'orgUnitPath',
            filter: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: [SENTINEL_ANY_VALUE],
            },
        })
    })

    test('clicking a tree node while "Any value" is active is a no-op', () => {
        const { store } = renderOrgUnitGroupFilter({
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: [SENTINEL_ANY_VALUE],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('country1'))
        expect(store.getActions()).toEqual([])
    })
})

describe('OrgUnitGroupFilterInput - search', () => {
    test('typing narrows to matching branches and auto-expands their ancestors', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: 'region1' } })
        expect(screen.getByLabelText('country1')).toBeInTheDocument()
        expect(screen.getByLabelText('region1')).toBeInTheDocument()
        expect(screen.queryByLabelText('country2')).not.toBeInTheDocument()
    })

    test('letters are allowed (unlike the date variant) since org unit ids/names are not purely numeric', () => {
        renderOrgUnitGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: 'facility3' } })
        expect(getInput()).toHaveValue('facility3')
        expect(screen.getByLabelText('country2')).toBeInTheDocument()
    })

    test('also narrows by resolved name, not just raw id', () => {
        renderOrgUnitGroupFilter({
            idToName: new Map([['country1', 'Sierra Leone']]),
        })
        openPopover()
        fireEvent.change(getInput(), { target: { value: 'Sierra' } })
        expect(screen.getByLabelText('Sierra Leone')).toBeInTheDocument()
        expect(screen.queryByLabelText('country2')).not.toBeInTheDocument()
    })

    test('typing text with no tree match shows the custom filter row but clears rather than filtering by the raw id/path', () => {
        const { store } = renderOrgUnitGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: 'Nairobi' } })
        expect(
            screen.getByTestId('data-table-column-filter-custom-Org unit')
        ).toBeInTheDocument()
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'orgUnitPath',
        })
        expect(store.getActions()).not.toContainEqual(
            expect.objectContaining({ type: DATA_FILTER_SET })
        )
    })

    test('committing a name-matched custom filter dispatches the matched nodes’ prefixes, not a raw substring match against the id path', () => {
        const { store } = renderOrgUnitGroupFilter({
            idToName: new Map([['country1', 'Sierra Leone']]),
        })
        openPopover()
        fireEvent.change(getInput(), { target: { value: 'Sierra' } })
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'orgUnitPath',
            filter: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
                searchDerived: true,
                searchText: 'Sierra',
            },
        })
    })

    test('a committed name-matched search narrows the table live but does not show any checkbox as checked - same as every other column’s typed "Contains" filter', () => {
        renderOrgUnitGroupFilter({
            idToName: new Map([['country1', 'Sierra Leone']]),
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
                searchDerived: true,
                searchText: 'Sierra',
            },
        })
        openPopover()
        expect(screen.getByLabelText('Sierra Leone').checked).toBe(false)
    })

    test('reopening after a committed search re-shows the typed text, not "N selected"', () => {
        renderOrgUnitGroupFilter({
            filterValue: {
                granularity: ORG_UNIT_GROUPS_GRANULARITY,
                prefixes: ['/country1'],
                searchDerived: true,
                searchText: 'Sierra',
            },
        })
        expect(getInput()).toHaveValue('Sierra')
    })
})
