import { render, screen } from '@testing-library/react'
import React from 'react'
import {
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_DATE,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    RENDERER_BOOLEAN,
    TYPE_DATE,
    ORG_UNIT_ID_DATA_KEY,
} from '../../../constants/dataTable.js'
import { DIGIT_GROUP_SEPARATOR_COMMA } from '../../../constants/settings.js'
import RowCells from '../RowCells.jsx'

const NAME_HEADER = { dataKey: 'name' }

const defaultProps = {
    visibleHeaders: [NAME_HEADER],
    hoveredFeature: null,
    layerId: 'layer1',
    rendererByDataKey: new Map(),
    typeByDataKey: new Map(),
    keyAnalysisDigitGroupSeparator: undefined,
}

const renderRow = (row, overrides = {}) =>
    render(
        <table>
            <tbody>
                <tr>
                    <RowCells {...defaultProps} {...overrides} row={row} />
                </tr>
            </tbody>
        </table>
    )

describe('RowCells', () => {
    it('renders a plain formatted value cell by default', () => {
        renderRow([
            { dataKey: 'id', value: 'row1' },
            { dataKey: 'name', value: 'Bo' },
        ])
        expect(screen.getByText('Bo')).toBeInTheDocument()
    })

    it('renders a color cell as a lowercased swatch value with a background color', () => {
        renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value: '#FF0000' },
            ],
            { rendererByDataKey: new Map([['name', RENDERER_COLOR]]) }
        )
        const cell = screen.getByText('#ff0000')
        expect(cell).toBeInTheDocument()
        expect(cell.closest('td')).toHaveStyle({
            backgroundColor: '#FF0000',
        })
    })

    it('renders an icon cell as an image', () => {
        const { container } = renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value: 'https://example.com/icon.png' },
            ],
            { rendererByDataKey: new Map([['name', RENDERER_ICON]]) }
        )
        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            'https://example.com/icon.png'
        )
    })

    it('renders a date-only cell formatted as just the date', () => {
        renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value: '2024-03-15T10:30:00' },
            ],
            {
                rendererByDataKey: new Map([['name', RENDERER_DATE]]),
                typeByDataKey: new Map([['name', TYPE_DATE]]),
            }
        )
        expect(screen.getByText('2024-03-15')).toBeInTheDocument()
    })

    it('renders a datetime cell formatted with the time', () => {
        renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value: '2024-03-15T10:30:00' },
            ],
            { rendererByDataKey: new Map([['name', RENDERER_DATE]]) }
        )
        expect(screen.getByText('2024-03-15 10:30')).toBeInTheDocument()
    })

    it('renders no checkbox', () => {
        renderRow([
            { dataKey: 'id', value: 'row1' },
            { dataKey: 'name', value: 'Bo' },
        ])
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('skips headers with no matching cell in the row', () => {
        renderRow([{ dataKey: 'id', value: 'row1' }])
        expect(screen.queryByText('Bo')).not.toBeInTheDocument()
    })

    it('groups the digits of a number with the system separator', () => {
        renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value: 1234567.5 },
            ],
            { keyAnalysisDigitGroupSeparator: DIGIT_GROUP_SEPARATOR_COMMA }
        )
        expect(screen.getByText('1,234,567.5')).toBeInTheDocument()
    })

    it('shows a zero', () => {
        const { container } = renderRow([
            { dataKey: 'id', value: 'row1' },
            { dataKey: 'name', value: 0 },
        ])
        expect(container.querySelector('td').textContent).toBe('0')
    })

    it('renders an org unit hierarchy cell as the names of its path, falling back to ids not resolved yet', () => {
        renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                {
                    dataKey: 'name',
                    value: '/ImspTQPwCqd/O6uvpzGd5pu/U6Kr7Gtpidn',
                },
            ],
            {
                rendererByDataKey: new Map([['name', RENDERER_ORG_UNIT]]),
                orgUnitIdToName: new Map([
                    ['ImspTQPwCqd', 'Sierra Leone'],
                    ['O6uvpzGd5pu', 'Bo'],
                ]),
            }
        )
        expect(
            screen.getByText('Sierra Leone / Bo / U6Kr7Gtpidn')
        ).toBeInTheDocument()
    })

    it('renders an org unit name cell as the name of the last org unit of the path', () => {
        renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value: '/ImspTQPwCqd/O6uvpzGd5pu' },
            ],
            {
                rendererByDataKey: new Map([['name', RENDERER_ORG_UNIT_NAME]]),
                orgUnitIdToName: new Map([['O6uvpzGd5pu', 'Bo']]),
            }
        )
        expect(screen.getByText('Bo')).toBeInTheDocument()
    })

    it.each([
        ['true', 'Yes'],
        ['1', 'Yes'],
        ['false', 'No'],
        ['0', 'No'],
    ])('renders the boolean value "%s" as %s', (value, text) => {
        renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value },
            ],
            { rendererByDataKey: new Map([['name', RENDERER_BOOLEAN]]) }
        )
        expect(screen.getByText(text)).toBeInTheDocument()
    })

    it.each([
        ['a plain', undefined, null],
        ['a plain', undefined, undefined],
        ['a color', RENDERER_COLOR, null],
        ['an icon', RENDERER_ICON, null],
        ['a date', RENDERER_DATE, null],
        ['a date', RENDERER_DATE, ''],
        ['an org unit hierarchy', RENDERER_ORG_UNIT, null],
        ['an org unit hierarchy', RENDERER_ORG_UNIT, ''],
        ['an org unit name', RENDERER_ORG_UNIT_NAME, null],
        ['a boolean', RENDERER_BOOLEAN, null],
    ])('leaves %s cell empty when its value is %p', (_, renderer, value) => {
        const { container } = renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'name', value },
            ],
            {
                rendererByDataKey: new Map(
                    renderer ? [['name', renderer]] : []
                ),
            }
        )
        const cell = container.querySelector('td')
        expect(cell.textContent).toBe('')
        expect(cell.querySelector('img')).toBeNull()
    })

    it('shows ids and colors in a monospace font', () => {
        const { container } = renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: ORG_UNIT_ID_DATA_KEY, value: 'O6uvpzGd5pu' },
                { dataKey: 'color', value: '#FF0000' },
                { dataKey: 'name', value: 'Bo' },
            ],
            {
                visibleHeaders: [
                    { dataKey: 'id' },
                    { dataKey: ORG_UNIT_ID_DATA_KEY },
                    { dataKey: 'color' },
                    NAME_HEADER,
                ],
                rendererByDataKey: new Map([['color', RENDERER_COLOR]]),
            }
        )
        const cells = [...container.querySelectorAll('td')]
        expect(cells.map((td) => td.classList.contains('monoCell'))).toEqual([
            true,
            true,
            true,
            false,
        ])
    })

    it('marks the cells of the hovered feature, except color cells', () => {
        const { container } = renderRow(
            [
                { dataKey: 'id', value: 'row1' },
                { dataKey: 'color', value: '#FF0000' },
            ],
            {
                visibleHeaders: [{ dataKey: 'id' }, { dataKey: 'color' }],
                rendererByDataKey: new Map([['color', RENDERER_COLOR]]),
                hoveredFeature: { id: 'row1', layerId: 'layer1' },
            }
        )
        const cells = [...container.querySelectorAll('td')]
        expect(cells.map((td) => td.classList.contains('hovered'))).toEqual([
            true,
            false,
        ])
    })
})
