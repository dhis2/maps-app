import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { VirtuosoMockContext } from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_SET,
    DATA_FILTER_CLEAR,
} from '../../../constants/actionTypes.js'
import { SENTINEL_ANY_VALUE } from '../../../constants/dataTable.js'
import useOptionSet from '../../../hooks/useOptionSet.js'
import FilterInput from '../FilterInput.jsx'

jest.mock('../../../hooks/useOptionSet.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'COMMA' },
    }),
}))

const mockStore = configureMockStore()

const renderFilterInput = (props, dataFilters) => {
    const store = mockStore({
        dataTable: 'layer1',
        map: {
            mapViews: [{ id: 'layer1', dataFilters: dataFilters || {} }],
        },
    })
    // The checkbox list is virtualized (react-virtuoso)
    const result = render(
        <Provider store={store}>
            <VirtuosoMockContext.Provider
                value={{ viewportHeight: 300, itemHeight: 28 }}
            >
                <FilterInput
                    dataKey="name"
                    name="Name"
                    type="string"
                    {...props}
                />
            </VirtuosoMockContext.Provider>
        </Provider>
    )
    return { ...result, store }
}

// The trigger and the dropdown's search field are the same <Input>
const getInput = (name) =>
    screen
        .getByTestId(`data-table-column-filter-search-${name}`)
        .querySelector('input')

const openPopover = (name) => fireEvent.focus(getInput(name))

describe('FilterInput with no known options (over the cap, or not yet loaded)', () => {
    test('shows an empty input with a "Search" placeholder by default', () => {
        renderFilterInput({})
        const input = getInput('Name')
        expect(input).toHaveValue('')
        expect(input).toHaveAttribute('placeholder', 'Search')
    })

    test('explains there is no picklist instead of showing an empty popover', () => {
        renderFilterInput({})
        openPopover('Name')
        expect(
            screen.getByText(
                'Too many values to list - type to filter this column'
            )
        ).toBeInTheDocument()
    })

    test('hides that hint once the user starts typing', () => {
        renderFilterInput({})
        openPopover('Name')
        fireEvent.change(getInput('Name'), {
            target: { value: 'hospital' },
        })
        expect(
            screen.queryByText(
                'Too many values to list - type to filter this column'
            )
        ).not.toBeInTheDocument()
    })

    test('shows the current filter value on the (closed) trigger', () => {
        renderFilterInput({}, { name: 'hospital' })
        expect(getInput('Name')).toHaveValue('hospital')
    })

    test('applies a custom filter live, as soon as it no longer matches an option', () => {
        const { store } = renderFilterInput({})
        openPopover('Name')
        fireEvent.change(getInput('Name'), {
            target: { value: 'hospital' },
        })
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'name',
            filter: 'hospital',
        })
    })

    test('wraps the search input in a numeric syntax help tooltip for number columns', () => {
        renderFilterInput({ type: 'number' })
        expect(
            screen.getByTestId('data-table-filter-help-reference')
        ).toBeInTheDocument()
    })

    test('also wraps the search input in a help tooltip for string columns', () => {
        renderFilterInput({ type: 'string' })
        expect(
            screen.getByTestId('data-table-filter-help-reference')
        ).toBeInTheDocument()
    })
})

describe('FilterInput multi-select path (no optionSetId)', () => {
    const options = [{ value: 'High' }, { value: 'Low' }]

    test('shows an empty input when nothing is selected', () => {
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        expect(getInput('Legend')).toHaveValue('')
    })

    test('shows the selected count on the closed trigger', () => {
        renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High'] }
        )
        expect(getInput('Legend')).toHaveValue('1 selected')
    })

    test('opens a popover with a checkbox per option, using the raw value as the label', () => {
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        openPopover('Legend')
        expect(screen.getByLabelText('High')).toBeInTheDocument()
        expect(screen.getByLabelText('Low')).toBeInTheDocument()
    })

    test('shows a "No value" label for the blank-value sentinel option', () => {
        renderFilterInput({
            dataKey: 'parentName',
            name: 'Parent',
            options: [{ value: '' }, { value: 'Country' }],
        })
        openPopover('Parent')
        expect(screen.getByLabelText('No value')).toBeInTheDocument()
        expect(screen.getByLabelText('Country')).toBeInTheDocument()
    })

    test('"No value" is grouped with "Any value" above the divider, not mixed into the searchable list', () => {
        renderFilterInput({
            dataKey: 'parentName',
            name: 'Parent',
            options: [{ value: '' }, { value: 'Country' }],
        })
        openPopover('Parent')
        expect(
            screen.getByLabelText('No value').closest('.pinnedOptions')
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText('Any value').closest('.pinnedOptions')
        ).toBeInTheDocument()
    })

    test('"No value" stays visible while searching, unlike the narrowed checkbox list', () => {
        renderFilterInput({
            dataKey: 'parentName',
            name: 'Parent',
            options: [{ value: '' }, { value: 'Country' }],
        })
        openPopover('Parent')
        fireEvent.change(getInput('Parent'), { target: { value: 'zzz' } })
        expect(screen.getByLabelText('No value')).toBeInTheDocument()
        expect(screen.queryByLabelText('Country')).not.toBeInTheDocument()
    })

    test('omits "No value" entirely when the column has no blank cells', () => {
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        openPopover('Legend')
        expect(screen.queryByLabelText('No value')).not.toBeInTheDocument()
    })

    test('renders Id column options in monospace', () => {
        renderFilterInput({
            dataKey: 'id',
            name: 'Id',
            options: [{ value: 'abc123' }],
        })
        openPopover('Id')
        expect(
            screen.getByLabelText('abc123').closest('.monoOption')
        ).toBeInTheDocument()
    })

    test('renders Icon column options as a thumbnail plus filename, not the raw URL', () => {
        renderFilterInput({
            dataKey: 'iconUrl',
            name: 'Icon',
            renderer: 'rendericon',
            options: [{ value: 'https://server/api/icons/mapMarker024.png' }],
        })
        openPopover('Icon')
        const checkbox = screen.getByLabelText('mapMarker024.png')
        expect(checkbox).toBeInTheDocument()
        expect(
            screen.queryByLabelText('https://server/api/icons/mapMarker024.png')
        ).not.toBeInTheDocument()
        expect(checkbox.closest('label').querySelector('img')).toHaveAttribute(
            'src',
            'https://server/api/icons/mapMarker024.png'
        )
    })

    test('formats numeric column options with the system digit group separator', () => {
        renderFilterInput({
            dataKey: 'value',
            name: 'Value',
            type: 'number',
            options: [{ value: '1234567' }],
        })
        openPopover('Value')
        expect(screen.getByLabelText('1,234,567')).toBeInTheDocument()
    })

    test('does not format non-numeric column options', () => {
        renderFilterInput({
            dataKey: 'legend',
            name: 'Legend',
            options: [{ value: '1000' }],
        })
        openPopover('Legend')
        expect(screen.getByLabelText('1000')).toBeInTheDocument()
    })
})

describe('FilterInput multi-select path (optionSetId)', () => {
    const options = [{ value: 'CONFIRMED' }, { value: 'PROBABLE' }]

    beforeEach(() => {
        useOptionSet.mockReturnValue({
            optionSet: {
                options: [
                    { code: 'CONFIRMED', name: 'Confirmed case' },
                    { code: 'PROBABLE', name: 'Probable case' },
                ],
            },
        })
    })

    test('resolves stored codes to display names in the popover', () => {
        renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options,
            optionSetId: 'optionSet1',
        })
        openPopover('Case classification')
        expect(screen.getByLabelText('Confirmed case')).toBeInTheDocument()
        expect(screen.getByLabelText('Probable case')).toBeInTheDocument()
    })

    test('falls back to the raw code when the option set has not loaded yet', () => {
        useOptionSet.mockReturnValue({ optionSet: null })
        renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options,
            optionSetId: 'optionSet1',
        })
        openPopover('Case classification')
        expect(screen.getByLabelText('CONFIRMED')).toBeInTheDocument()
    })

    test('search narrows the list by the resolved label, not the raw code', () => {
        renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options,
            optionSetId: 'optionSet1',
        })
        openPopover('Case classification')
        fireEvent.change(getInput('Case classification'), {
            target: { value: 'confirmed' },
        })
        expect(screen.getByLabelText('Confirmed case')).toBeInTheDocument()
        expect(screen.queryByLabelText('Probable case')).not.toBeInTheDocument()
    })

    test('never shows a custom-filter row, even for non-matching text', () => {
        renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options,
            optionSetId: 'optionSet1',
        })
        openPopover('Case classification')
        fireEvent.change(getInput('Case classification'), {
            target: { value: 'no such option anywhere' },
        })
        expect(
            screen.queryByTestId(
                'data-table-column-filter-custom-Case classification'
            )
        ).not.toBeInTheDocument()
    })

    test('typing never dispatches a filter (custom filter disabled)', () => {
        const { store } = renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options,
            optionSetId: 'optionSet1',
        })
        openPopover('Case classification')
        fireEvent.change(getInput('Case classification'), {
            target: { value: 'no such option anywhere' },
        })
        expect(store.getActions()).toEqual([])
    })
})

describe('FilterInput searchable popover — search', () => {
    const options = [{ value: 'High' }, { value: 'Low' }]

    test('narrows the checkbox list to matching labels', () => {
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), {
            target: { value: 'hi' },
        })
        expect(screen.getByLabelText('High')).toBeInTheDocument()
        expect(screen.queryByLabelText('Low')).not.toBeInTheDocument()
    })

    test("narrows a numeric column's checkbox list using the typed filter expression, not substring match", () => {
        renderFilterInput({
            dataKey: 'value',
            name: 'Value',
            type: 'number',
            options: [{ value: '10' }, { value: '150' }, { value: '200' }],
        })
        openPopover('Value')
        fireEvent.change(getInput('Value'), {
            target: { value: '< 100' },
        })
        expect(screen.getByLabelText('10')).toBeInTheDocument()
        expect(screen.queryByLabelText('150')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('200')).not.toBeInTheDocument()
    })

    test('shows a "no matches" message when nothing matches and no custom filter applies', () => {
        useOptionSet.mockReturnValue({
            optionSet: { options: [{ code: 'CONFIRMED', name: 'Confirmed' }] },
        })
        renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options: [{ value: 'CONFIRMED' }],
            optionSetId: 'optionSet1',
        })
        openPopover('Case classification')
        fireEvent.change(getInput('Case classification'), {
            target: { value: 'zzz' },
        })
        expect(screen.getByText('No matches')).toBeInTheDocument()
    })
})

describe('FilterInput searchable popover — custom filter row', () => {
    test('offers "Use filter" wording and dispatches the typed text live for number columns', () => {
        const { store } = renderFilterInput({
            dataKey: 'value',
            name: 'Value',
            type: 'number',
            options: [{ value: '10' }, { value: '20' }],
        })
        openPopover('Value')
        fireEvent.change(getInput('Value'), {
            target: { value: '> 15' },
        })
        const row = screen.getByTestId('data-table-column-filter-custom-Value')
        expect(row).toHaveTextContent('Use filter')
        expect(row).toHaveTextContent('> 15')

        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'value',
            filter: '> 15',
        })
    })

    test('strips letters typed into a numeric column, keeping the filter syntax characters', () => {
        renderFilterInput({
            dataKey: 'value',
            name: 'Value',
            type: 'number',
            options: [{ value: '10' }, { value: '20' }],
        })
        openPopover('Value')
        fireEvent.change(getInput('Value'), {
            target: { value: 'abc> 1x5xyz' },
        })
        expect(getInput('Value')).toHaveValue('> 15')
    })

    test('offers "Contains" wording for string columns', () => {
        const options = [{ value: 'High' }, { value: 'Low' }]
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), {
            target: { value: 'medium' },
        })
        const row = screen.getByTestId('data-table-column-filter-custom-Legend')
        expect(row).toHaveTextContent('Contains')
        expect(row).toHaveTextContent('medium')
    })

    test('stays shown and keeps live-applying even when the typed text exactly matches an existing option', () => {
        const { store } = renderFilterInput({
            dataKey: 'legend',
            name: 'Legend',
            options: [{ value: 'High' }, { value: 'Low' }],
        })
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), {
            target: { value: 'High' },
        })
        expect(
            screen.getByTestId('data-table-column-filter-custom-Legend')
        ).toBeInTheDocument()
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: 'High',
        })
    })

    test('clearing the typed text clears an already-applied custom filter live', () => {
        const options = [{ value: 'High' }, { value: 'Low' }]
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: 'medium' }
        )
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), { target: { value: '' } })
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'legend',
        })
    })
})

describe('FilterInput searchable popover — keyboard behavior', () => {
    const options = [{ value: 'High' }, { value: 'Low' }]

    test('Enter applies the highlighted checkbox and closes the popover', () => {
        const { store } = renderFilterInput({
            dataKey: 'legend',
            name: 'Legend',
            options,
        })
        openPopover('Legend')
        const input = getInput('Legend')
        fireEvent.keyDown(input, { key: 'ArrowDown' })
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: ['High'],
        })
        expect(screen.queryByLabelText('High')).not.toBeInTheDocument()
    })

    test('Enter applies the custom filter directly with no prior arrow-navigation, and closes', () => {
        const { store } = renderFilterInput({
            dataKey: 'legend',
            name: 'Legend',
            options,
        })
        openPopover('Legend')
        const input = getInput('Legend')
        fireEvent.change(input, { target: { value: 'medium' } })
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: 'medium',
        })
        expect(
            screen.queryByTestId('data-table-column-filter-custom-Legend')
        ).not.toBeInTheDocument()
    })

    test('Escape closes the popover without dispatching anything further', () => {
        const { store } = renderFilterInput({
            dataKey: 'legend',
            name: 'Legend',
            options,
        })
        openPopover('Legend')
        const input = getInput('Legend')
        fireEvent.keyDown(input, { key: 'Escape' })

        expect(store.getActions()).toEqual([])
        expect(
            screen.queryByTestId('data-table-column-filter-custom-Legend')
        ).not.toBeInTheDocument()
    })
})

describe('FilterInput searchable popover — clear filter', () => {
    const options = [{ value: 'High' }, { value: 'Low' }]

    test('clearing an active array (checkbox) filter closes it out', () => {
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High'] }
        )
        fireEvent.change(getInput('Legend'), { target: { value: '' } })
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'legend',
        })
    })

    test('clearing an active custom-string filter closes it out', () => {
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: 'medium' }
        )
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), { target: { value: '' } })
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'legend',
        })
    })

    test('clearing empty text with no active filter dispatches nothing', () => {
        const { store } = renderFilterInput({
            dataKey: 'legend',
            name: 'Legend',
            options,
        })
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), { target: { value: '' } })
        expect(store.getActions()).toEqual([])
    })

    test('checking the pinned "Any value" option collapses any existing selection into just SENTINEL_ANY_VALUE', () => {
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High'] }
        )
        openPopover('Legend')
        fireEvent.click(screen.getByLabelText('Any value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: [SENTINEL_ANY_VALUE],
        })
    })

    test('"Any value" is only checked when it is itself part of the selection - it does not track whether any filter is active', () => {
        renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High'] }
        )
        openPopover('Legend')
        expect(screen.getByLabelText('Any value')).not.toBeChecked()
    })

    test('"Any value" stays checked when it is explicitly selected', () => {
        renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: [SENTINEL_ANY_VALUE] }
        )
        openPopover('Legend')
        expect(screen.getByLabelText('Any value')).toBeChecked()
    })

    test('"Any value" stays visible while searching, unlike the narrowed checkbox list', () => {
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), { target: { value: 'hi' } })
        expect(screen.getByLabelText('Any value')).toBeInTheDocument()
    })
})

describe('FilterInput searchable popover — reopening state', () => {
    test('pre-fills the search box with an already-applied custom filter', () => {
        const options = [{ value: '10' }, { value: '20' }]
        renderFilterInput(
            { dataKey: 'value', name: 'Value', type: 'number', options },
            { value: '> 5' }
        )
        openPopover('Value')
        expect(getInput('Value')).toHaveValue('> 5')
    })
})

describe('FilterInput searchable popover — dropdown placement', () => {
    test('opens below the trigger by default', () => {
        const options = [{ value: 'High' }, { value: 'Low' }]
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        openPopover('Legend')
        expect(
            screen.getByLabelText('High').closest('.dropdownPopperAbove')
        ).not.toBeInTheDocument()
    })

    test('flips above when the shared header row has no room to open below', () => {
        const options = [{ value: 'High' }, { value: 'Low' }]
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        const trigger = getInput('Legend').closest('.filterTrigger')
        jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
            bottom: window.innerHeight - 50,
            top: window.innerHeight - 78,
            width: 100,
        })
        openPopover('Legend')
        expect(
            screen.getByLabelText('High').closest('.dropdownPopperAbove')
        ).toBeInTheDocument()
    })
})

describe('FilterInput searchable popover — reverse selection', () => {
    const getReverseButton = (name) =>
        screen.getByTestId(`data-table-column-filter-reverse-${name}`)

    test('selects "Any value" when nothing is currently selected - every real value ends up ticked, which collapses to the wildcard', () => {
        const options = [
            { value: 'High' },
            { value: 'Medium' },
            { value: 'Low' },
        ]
        const { store } = renderFilterInput({
            dataKey: 'legend',
            name: 'Legend',
            options,
        })
        openPopover('Legend')
        fireEvent.click(getReverseButton('Legend'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: [SENTINEL_ANY_VALUE],
        })
    })

    test("flips each value's checked state relative to the current selection", () => {
        const options = [
            { value: 'High' },
            { value: 'Medium' },
            { value: 'Low' },
        ]
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High'] }
        )
        openPopover('Legend')
        fireEvent.click(getReverseButton('Legend'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: ['Medium', 'Low'],
        })
    })

    test('includes "No value" in the values it flips', () => {
        const options = [
            { value: '' },
            { value: 'Country' },
            { value: 'District' },
        ]
        const { store } = renderFilterInput(
            { dataKey: 'parentName', name: 'Parent', options },
            { parentName: ['Country'] }
        )
        openPopover('Parent')
        fireEvent.click(getReverseButton('Parent'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'parentName',
            filter: ['', 'District'],
        })
    })

    test('collapses to "Any value" (plus "No value" if that was unset) when reversing ends up ticking every real value', () => {
        const options = [{ value: '' }, { value: 'Country' }]
        const { store } = renderFilterInput({
            dataKey: 'parentName',
            name: 'Parent',
            options,
        })
        openPopover('Parent')
        fireEvent.click(getReverseButton('Parent'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'parentName',
            filter: [SENTINEL_ANY_VALUE, ''],
        })
    })

    test('turns off "Any value" (and every real value with it) when it was active - there is no way to represent "all unticked" while it stays on', () => {
        const options = [{ value: 'High' }, { value: 'Low' }]
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High', SENTINEL_ANY_VALUE] }
        )
        openPopover('Legend')
        fireEvent.click(getReverseButton('Legend'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'legend',
        })
    })

    test('reversing while "Any value" is active flips "No value" independently, since it is unaffected by "Any value"', () => {
        const options = [{ value: '' }, { value: 'Country' }]
        const { store } = renderFilterInput(
            { dataKey: 'parentName', name: 'Parent', options },
            { parentName: [SENTINEL_ANY_VALUE] }
        )
        openPopover('Parent')
        fireEvent.click(getReverseButton('Parent'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'parentName',
            filter: [''],
        })
    })

    test('ignores the current search text - inverts the full value list, not just what is visible', () => {
        const options = [
            { value: 'High' },
            { value: 'Medium' },
            { value: 'Low' },
        ]
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High'] }
        )
        openPopover('Legend')
        fireEvent.change(getInput('Legend'), { target: { value: 'lo' } })
        fireEvent.click(getReverseButton('Legend'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: ['Medium', 'Low'],
        })
    })

    test('is disabled when the column has no known values to invert', () => {
        renderFilterInput({ dataKey: 'name', name: 'Name' })
        openPopover('Name')
        expect(getReverseButton('Name')).toBeDisabled()
    })
})

describe('FilterInput searchable popover — "Any value" / real value interaction', () => {
    const options = [{ value: 'High' }, { value: 'Medium' }, { value: 'Low' }]

    test('every real value reads as checked while "Any value" is active', () => {
        renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: [SENTINEL_ANY_VALUE] }
        )
        openPopover('Legend')
        expect(screen.getByLabelText('High')).toBeChecked()
        expect(screen.getByLabelText('Medium')).toBeChecked()
        expect(screen.getByLabelText('Low')).toBeChecked()
    })

    test('"No value" does not read as checked just because "Any value" is active', () => {
        renderFilterInput(
            {
                dataKey: 'parentName',
                name: 'Parent',
                options: [{ value: '' }, { value: 'Country' }],
            },
            { parentName: [SENTINEL_ANY_VALUE] }
        )
        openPopover('Parent')
        expect(screen.getByLabelText('No value')).not.toBeChecked()
    })

    test('unticking one real value while "Any value" is active unticks "Any value" too, but keeps every other value ticked', () => {
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: [SENTINEL_ANY_VALUE] }
        )
        openPopover('Legend')
        fireEvent.click(screen.getByLabelText('Medium'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: ['High', 'Low'],
        })
    })

    test('unticking a real value while "Any value" is active preserves "No value" if it was set', () => {
        const { store } = renderFilterInput(
            {
                dataKey: 'parentName',
                name: 'Parent',
                options: [{ value: '' }, { value: 'A' }, { value: 'B' }],
            },
            { parentName: [SENTINEL_ANY_VALUE, ''] }
        )
        openPopover('Parent')
        fireEvent.click(screen.getByLabelText('A'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'parentName',
            filter: ['B', ''],
        })
    })

    test('manually ticking every real value collapses the selection into "Any value"', () => {
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High', 'Medium'] }
        )
        openPopover('Legend')
        fireEvent.click(screen.getByLabelText('Low'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'legend',
            filter: [SENTINEL_ANY_VALUE],
        })
    })

    test('manually ticking every real value preserves "No value" while collapsing to "Any value"', () => {
        const { store } = renderFilterInput(
            {
                dataKey: 'parentName',
                name: 'Parent',
                options: [{ value: '' }, { value: 'A' }, { value: 'B' }],
            },
            { parentName: ['A', ''] }
        )
        openPopover('Parent')
        fireEvent.click(screen.getByLabelText('B'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'parentName',
            filter: [SENTINEL_ANY_VALUE, ''],
        })
    })

    test('unchecking "Any value" unticks every real value too, not just the wildcard', () => {
        const { store } = renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: [SENTINEL_ANY_VALUE] }
        )
        openPopover('Legend')
        fireEvent.click(screen.getByLabelText('Any value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'legend',
        })
    })

    test('unchecking "Any value" preserves "No value" independently', () => {
        const { store } = renderFilterInput(
            {
                dataKey: 'parentName',
                name: 'Parent',
                options: [{ value: '' }, { value: 'Country' }],
            },
            { parentName: [SENTINEL_ANY_VALUE, ''] }
        )
        openPopover('Parent')
        fireEvent.click(screen.getByLabelText('Any value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'parentName',
            filter: [''],
        })
    })
})
