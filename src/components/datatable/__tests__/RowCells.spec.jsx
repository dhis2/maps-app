import { render, screen } from '@testing-library/react'
import React from 'react'
import {
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_DATE,
    TYPE_DATE,
} from '../../../constants/dataTable.js'
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
})
