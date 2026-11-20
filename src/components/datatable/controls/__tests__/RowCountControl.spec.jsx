import { render, screen } from '@testing-library/react'
import React from 'react'
import {
    DIGIT_GROUP_SEPARATOR_COMMA,
    DIGIT_GROUP_SEPARATOR_SPACE,
} from '../../../../constants/settings.js'
import RowCountControl from '../RowCountControl.jsx'

describe('RowCountControl', () => {
    test.each([
        [DIGIT_GROUP_SEPARATOR_SPACE, '1 166 rows'],
        [DIGIT_GROUP_SEPARATOR_COMMA, '1,166 rows'],
    ])('groups the digits of the row count with %s', (separator, label) => {
        render(
            <RowCountControl
                totalCount={1166}
                filteredCount={1166}
                keyAnalysisDigitGroupSeparator={separator}
            />
        )

        expect(screen.getByText(label)).toBeInTheDocument()
    })

    test('groups the digits of the filtered and total counts', () => {
        render(
            <RowCountControl
                totalCount={12500}
                filteredCount={1166}
                keyAnalysisDigitGroupSeparator={DIGIT_GROUP_SEPARATOR_COMMA}
            />
        )

        expect(screen.getByText('1,166 of 12,500 rows')).toBeInTheDocument()
    })
})
