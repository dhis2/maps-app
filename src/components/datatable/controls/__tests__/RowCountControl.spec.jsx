import { render, screen } from '@testing-library/react'
import React from 'react'
import RowCountControl from '../RowCountControl.jsx'

describe('RowCountControl', () => {
    test('renders nothing while counts are not yet known', () => {
        const { container } = render(
            <RowCountControl totalCount={null} filteredCount={null} />
        )
        expect(container).toBeEmptyDOMElement()
    })

    test('shows just the total when nothing is filtered out', () => {
        render(<RowCountControl totalCount={12345} filteredCount={12345} />)
        expect(screen.getByText('12345 rows')).toBeInTheDocument()
    })

    test('shows filtered/total when rows have been filtered out', () => {
        render(<RowCountControl totalCount={12345} filteredCount={42} />)
        expect(screen.getByText('42 of 12345 rows')).toBeInTheDocument()
    })

    test('applies the digit-group separator to both numbers', () => {
        render(
            <RowCountControl
                totalCount={12345}
                filteredCount={42}
                keyAnalysisDigitGroupSeparator="COMMA"
            />
        )
        expect(screen.getByText('42 of 12,345 rows')).toBeInTheDocument()
    })

    test('applies the digit-group separator to the total-only label too', () => {
        render(
            <RowCountControl
                totalCount={12345}
                filteredCount={12345}
                keyAnalysisDigitGroupSeparator="COMMA"
            />
        )
        expect(screen.getByText('12,345 rows')).toBeInTheDocument()
    })
})
