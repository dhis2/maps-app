import {
    RENDERER_COLOR,
    RENDERER_DATE,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    RENDERER_BOOLEAN,
    TYPE_DATE,
    TYPE_DATETIME,
} from '../../constants/dataTable.js'
import { DIGIT_GROUP_SEPARATOR_SPACE } from '../../constants/settings.js'
import { formatCellText } from '../cellValue.js'

const orgUnitIdToName = new Map([
    ['ImspTQPwCqd', 'Sierra Leone'],
    ['O6uvpzGd5pu', 'Bo'],
])

describe('formatCellText', () => {
    test.each([
        {
            name: 'a number with digit grouping',
            value: 12345.6,
            expected: '12 345.6',
        },
        { name: 'text unchanged', value: 'Bo', expected: 'Bo' },
        {
            name: 'a color in lower case',
            value: '#FF00AA',
            renderer: RENDERER_COLOR,
            expected: '#ff00aa',
        },
        {
            name: 'a date without its time',
            value: '2024-03-15T10:30:00',
            renderer: RENDERER_DATE,
            type: TYPE_DATE,
            expected: '2024-03-15',
        },
        {
            name: 'a date and time to the minute',
            value: '2024-03-15T10:30:00',
            renderer: RENDERER_DATE,
            type: TYPE_DATETIME,
            expected: '2024-03-15 10:30',
        },
        {
            name: 'an org unit path as names',
            value: '/ImspTQPwCqd/O6uvpzGd5pu',
            renderer: RENDERER_ORG_UNIT,
            expected: 'Sierra Leone / Bo',
        },
        {
            name: 'an org unit path as the last org unit name',
            value: '/ImspTQPwCqd/O6uvpzGd5pu',
            renderer: RENDERER_ORG_UNIT_NAME,
            expected: 'Bo',
        },
        {
            name: 'a boolean as Yes',
            value: 'true',
            renderer: RENDERER_BOOLEAN,
            expected: 'Yes',
        },
        {
            name: 'a boolean as No',
            value: '0',
            renderer: RENDERER_BOOLEAN,
            expected: 'No',
        },
    ])('formats $name', ({ value, renderer, type, expected }) => {
        expect(
            formatCellText(value, {
                renderer,
                type,
                orgUnitIdToName,
                keyAnalysisDigitGroupSeparator: DIGIT_GROUP_SEPARATOR_SPACE,
            })
        ).toBe(expected)
    })

    test.each([null, undefined, ''])(
        'returns an empty text for the missing value %p, whatever the renderer',
        (value) => {
            for (const renderer of [
                undefined,
                RENDERER_COLOR,
                RENDERER_DATE,
                RENDERER_ORG_UNIT,
                RENDERER_ORG_UNIT_NAME,
                RENDERER_BOOLEAN,
            ]) {
                expect(formatCellText(value, { renderer })).toBe('')
            }
        }
    )
})
