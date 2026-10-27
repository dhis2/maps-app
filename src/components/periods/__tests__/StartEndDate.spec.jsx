import { act, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'
import configureMockStore from 'redux-mock-store'
import { setEndDate, setStartDate } from '../../../actions/layerEdit.js'
import layerEdit from '../../../reducers/layerEdit.js'
import StartEndDate from '../StartEndDate.jsx'

const mockStore = configureMockStore()

describe('StartEndDate Component', () => {
    let store
    let props

    beforeEach(() => {
        store = mockStore({
            layerEdit: {
                startDate: '2023-01-01',
                endDate: '2023-12-31',
            },
        })
        props = {
            periodsSettings: {
                calendar: 'gregorian',
                locale: 'en',
            },
            onSelectEndDate: jest.fn(),
            onSelectStartDate: jest.fn(),
        }
    })

    it('renders StartEndDate with initial dates', () => {
        render(
            <Provider store={store}>
                <StartEndDate {...props} />
            </Provider>
        )
        const startDateInput = screen.getByTestId('start-date-input-content')

        const input = within(startDateInput).getByRole('textbox')

        expect(input).toBeInTheDocument()
        expect(input).toHaveValue('2023-01-01')

        const endDateInput = screen.getByTestId('end-date-input-content')
        const endInput = within(endDateInput).getByRole('textbox')
        expect(endInput).toBeInTheDocument()
        expect(endInput).toHaveValue('2023-12-31')
    })
})

describe('StartEndDate typing', () => {
    // Wired like the layer dialogs, with the real layerEdit reducer
    const renderWithStore = ({ startDate = '', endDate = '' } = {}) => {
        const store = createStore(combineReducers({ layerEdit }), {
            layerEdit: { startDate, endDate },
        })
        render(
            <Provider store={store}>
                <StartEndDate
                    onSelectStartDate={(v) => store.dispatch(setStartDate(v))}
                    onSelectEndDate={(v) => store.dispatch(setEndDate(v))}
                    periodsSettings={{ calendar: 'iso8601', locale: 'en' }}
                />
            </Provider>
        )
        return store
    }

    const getInput = (type) =>
        within(screen.getByTestId(`${type}-date-input-content`)).getByRole(
            'textbox'
        )

    // Bypasses React's value tracking so the input event is seen as a change
    const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
    ).set

    // Does what the browser does on a keystroke: change the value, move the
    // caret, then fire an input event
    const edit = (input, value, caret) => {
        act(() => {
            setValue.call(input, value)
            input.setSelectionRange(caret, caret)
            input.dispatchEvent(new Event('input', { bubbles: true }))
        })
    }

    const replaceSelection = (input, text) => {
        const { value, selectionStart: start, selectionEnd: end } = input
        edit(
            input,
            value.slice(0, start) + text + value.slice(end),
            start + text.length
        )
    }

    const inputState = ({ value, selectionStart }) =>
        `${value}|${selectionStart}`

    // Each step returns the input state ("value|caret") after each keystroke
    const STEPS = {
        type: (input, text) =>
            [...text].map((char) => {
                replaceSelection(input, char)
                return inputState(input)
            }),
        paste: (input, text) => {
            replaceSelection(input, text)
            return [inputState(input)]
        },
        backspace: (input, count) =>
            Array.from({ length: count }, () => {
                const { value, selectionStart: start } = input
                edit(
                    input,
                    value.slice(0, start - 1) + value.slice(start),
                    start - 1
                )
                return inputState(input)
            }),
        delete: (input) => {
            const { value, selectionStart: start } = input
            edit(input, value.slice(0, start) + value.slice(start + 1), start)
            return [inputState(input)]
        },
        caret: (input, position) => {
            input.setSelectionRange(position, position)
            return [inputState(input)]
        },
        select: (input, [start, end]) => {
            input.setSelectionRange(start, end)
            return [inputState(input)]
        },
        blur: (input) => {
            fireEvent.blur(input)
            return [inputState(input)]
        },
    }

    const run = (input, steps) =>
        steps.flatMap(([step, arg]) => STEPS[step](input, arg))

    const year = new Date().getFullYear()

    // [description, initial date, steps, expected "value|caret" after each step]
    const SCENARIOS = [
        [
            'adds hyphens when typing digits only',
            '',
            [['type', '20240315']],
            [
                '2|1',
                '20|2',
                '202|3',
                '2024|4',
                '2024-0|6',
                '2024-03|7',
                '2024-03-1|9',
                '2024-03-15|10',
            ],
        ],
        [
            'accepts typed hyphens',
            '',
            [['type', '2024-03-15']],
            [
                '2|1',
                '20|2',
                '202|3',
                '2024|4',
                '2024-|5',
                '2024-0|6',
                '2024-03|7',
                '2024-03-|8',
                '2024-03-1|9',
                '2024-03-15|10',
            ],
        ],
        [
            'clamps 31 February to 28 in a common year',
            '',
            [['type', '20230231']],
            [
                '2|1',
                '20|2',
                '202|3',
                '2023|4',
                '2023-0|6',
                '2023-02|7',
                '2023-02-3|9',
                '2023-02-28|10',
            ],
        ],
        [
            'clamps 30 February to 29 in a leap year',
            '',
            [['type', '20240230']],
            [
                '2|1',
                '20|2',
                '202|3',
                '2024|4',
                '2024-0|6',
                '2024-02|7',
                '2024-02-3|9',
                '2024-02-29|10',
            ],
        ],
        [
            'clamps month 13 and day 45',
            '',
            [['type', '20241345']],
            [
                '2|1',
                '20|2',
                '202|3',
                '2024|4',
                '2024-1|6',
                '2024-12|7',
                '2024-12-4|9',
                '2024-12-31|10',
            ],
        ],
        [
            'turns month and day 00 into 01',
            '',
            [['type', '20240000']],
            [
                '2|1',
                '20|2',
                '202|3',
                '2024|4',
                '2024-0|6',
                '2024-01|7',
                '2024-01-0|9',
                '2024-01-01|10',
            ],
        ],
        [
            'fills in the current year for 0000',
            '',
            [['type', '00000115']],
            [
                '0|1',
                '00|2',
                '000|3',
                `${year}|4`,
                `${year}-0|6`,
                `${year}-01|7`,
                `${year}-01-1|9`,
                `${year}-01-15|10`,
            ],
        ],
        [
            'pads a single digit month and day',
            '',
            [['type', '2024-3-5'], ['blur']],
            [
                '2|1',
                '20|2',
                '202|3',
                '2024|4',
                '2024-|5',
                '2024-3|6',
                '2024-03-|8',
                '2024-03-5|9',
                '2024-03-05|10',
            ],
        ],
        [
            'drops a trailing hyphen on blur',
            '',
            [['type', '2024-'], ['blur']],
            ['2|1', '20|2', '202|3', '2024|4', '2024-|5', '2024|4'],
        ],
        [
            'ignores letters',
            '',
            [['type', '2a0b24c']],
            ['2|1', '2|1', '20|2', '20|2', '202|3', '2024|4', '2024|4'],
        ],
        [
            'can be emptied with backspace and retyped',
            '2023-01-01',
            [
                ['caret', 10],
                ['backspace', 10],
                ['type', '2024-12-31'],
            ],
            [
                '2023-01-01|10',
                ...Array(9).fill(null),
                '|0',
                '2|1',
                '20|2',
                '202|3',
                '2024|4',
                '2024-|5',
                '2024-1|6',
                '2024-12|7',
                '2024-12-|8',
                '2024-12-3|9',
                '2024-12-31|10',
            ],
        ],
        [
            'overwrites a year digit',
            '2023-01-01',
            [
                ['caret', 3],
                ['type', '4'],
            ],
            ['2023-01-01|3', '2024-01-01|4'],
        ],
        [
            'overwrites the month',
            '2023-01-01',
            [
                ['caret', 5],
                ['type', '12'],
            ],
            ['2023-01-01|5', '2023-11-01|6', '2023-12-01|7'],
        ],
        [
            'clamps the day when the month changes to February',
            '2023-01-31',
            [
                ['caret', 5],
                ['type', '02'],
            ],
            ['2023-01-31|5', '2023-01-31|6', '2023-02-28|7'],
        ],
        [
            // current behaviour: the first digit already clamps 31 to 29
            'clamps the day as each digit is overwritten',
            '2024-02-01',
            [
                ['caret', 8],
                ['type', '31'],
            ],
            ['2024-02-01|8', '2024-02-29|9', '2024-02-21|10'],
        ],
        [
            // current behaviour: deleting in the middle is not allowed
            'keeps the date on backspace in the middle',
            '2023-01-01',
            [
                ['caret', 6],
                ['backspace', 1],
            ],
            ['2023-01-01|6', '2023-01-01|5'],
        ],
        [
            // current behaviour: deleting in the middle is not allowed
            'keeps the date on delete in the middle',
            '2023-01-01',
            [['caret', 5], ['delete']],
            ['2023-01-01|5', '2023-01-01|5'],
        ],
        [
            'replaces the whole date when all is selected',
            '2023-01-01',
            [
                ['select', [0, 10]],
                ['type', '2025-06-07'],
            ],
            [
                '2023-01-01|0',
                '2|1',
                '20|2',
                '202|3',
                '2025|4',
                '2025-|5',
                '2025-0|6',
                '2025-06|7',
                '2025-06-|8',
                '2025-06-0|9',
                '2025-06-07|10',
            ],
        ],
        [
            // current behaviour: typing over a partial selection is ignored
            'keeps the date when typing over a selected month',
            '2023-01-01',
            [
                ['select', [5, 7]],
                ['type', '11'],
            ],
            ['2023-01-01|5', '2023-01-01|6', '2023-01-01|7'],
        ],
        [
            'accepts a pasted date',
            '',
            [['paste', '2024-07-04']],
            ['2024-07-04|10'],
        ],
        [
            'replaces the date with a pasted one',
            '2023-01-01',
            [
                ['select', [0, 10]],
                ['paste', '2022-11-30'],
            ],
            ['2023-01-01|0', '2022-11-30|10'],
        ],
    ]

    // Dates of saved maps can have a time part, which is dropped on the
    // first edit or blur
    const SAVED_DATES = ['2023-01-31T00:00:00.000', '2023-01-31T00:00:00']

    // [description, steps, expected "value|caret" after each step, stored date]
    const SAVED_DATE_SCENARIOS = [
        ['drops the time on blur', [['blur']], ['2023-01-31|10'], '2023-01-31'],
        [
            'clamps the day when the month changes to February',
            [
                ['caret', 5],
                ['type', '02'],
            ],
            ['2023-01-31|5', '2023-01-31|6', '2023-02-28|7'],
            '2023-02-28',
        ],
        [
            'overwrites the year',
            [
                ['caret', 0],
                ['type', '2024'],
            ],
            [
                '2023-01-31|0',
                '2023-01-31|1',
                '2023-01-31|2',
                '2023-01-31|3',
                '2024-01-31|4',
            ],
            '2024-01-31',
        ],
        [
            'retypes the day after backspace',
            [
                ['caret', 10],
                ['backspace', 2],
                ['type', '15'],
            ],
            [
                '2023-01-31|10',
                null,
                '2023-01-|8',
                '2023-01-1|9',
                '2023-01-15|10',
            ],
            '2023-01-15',
        ],
        [
            'replaces the whole date when all is selected',
            [
                ['select', [0, 10]],
                ['type', '20250607'],
            ],
            [
                '2023-01-31|0',
                '2|1',
                '20|2',
                '202|3',
                '2025|4',
                '2025-0|6',
                '2025-06|7',
                '2025-06-0|9',
                '2025-06-07|10',
            ],
            '2025-06-07',
        ],
        [
            'replaces the date with a pasted one with a time part',
            [
                ['select', [0, 10]],
                ['paste', '2022-11-30T00:00:00.000'],
            ],
            ['2023-01-31|0', '2022-11-30|10'],
            '2022-11-30',
        ],
        [
            'ignores typing after the end of the date',
            [
                ['caret', 10],
                ['type', '5'],
            ],
            ['2023-01-31|10', '2023-01-31|10'],
            '2023-01-31',
        ],
    ]

    // null entries are intermediate states that aren't checked
    const expectStates = (states, expected) =>
        expect(
            states.map((state, i) => (expected[i] === null ? null : state))
        ).toEqual(expected)

    describe.each([
        ['start', 'startDate'],
        ['end', 'endDate'],
    ])('%s date input', (type, stateKey) => {
        it.each(
            SCENARIOS.map(([name, initialDate, steps, expected]) => ({
                name,
                initialDate,
                steps,
                expected,
            }))
        )('$name', ({ initialDate, steps, expected }) => {
            const store = renderWithStore({ [stateKey]: initialDate })
            const input = getInput(type)
            expectStates(run(input, steps), expected)
            expect(store.getState().layerEdit[stateKey]).toBe(input.value)
        })

        describe.each(SAVED_DATES)('saved date %s', (savedDate) => {
            it('is shown without the time', () => {
                const store = renderWithStore({ [stateKey]: savedDate })

                expect(getInput(type)).toHaveValue('2023-01-31')
                expect(store.getState().layerEdit[stateKey]).toBe(savedDate)
            })

            it.each(
                SAVED_DATE_SCENARIOS.map(
                    ([name, steps, expected, storedDate]) => ({
                        name,
                        steps,
                        expected,
                        storedDate,
                    })
                )
            )('$name', ({ steps, expected, storedDate }) => {
                const store = renderWithStore({ [stateKey]: savedDate })

                expectStates(run(getInput(type), steps), expected)
                expect(store.getState().layerEdit[stateKey]).toBe(storedDate)
            })
        })

        it('is emptied by the Clear button', () => {
            const store = renderWithStore({ [stateKey]: '2023-01-01' })
            const field = getInput(type).closest(`.${type}`).parentElement
            fireEvent.click(within(field).getByText('Clear'))

            expect(getInput(type)).toHaveValue('')
            expect(store.getState().layerEdit[stateKey]).toBeUndefined()
        })

        it('takes a day picked in the calendar', () => {
            const store = renderWithStore({ [stateKey]: '2023-01-01' })
            act(() => getInput(type).focus())
            fireEvent.click(screen.getByText('15'))

            expect(getInput(type)).toHaveValue('2023-01-15')
            expect(store.getState().layerEdit[stateKey]).toBe('2023-01-15')
        })
    })
})
