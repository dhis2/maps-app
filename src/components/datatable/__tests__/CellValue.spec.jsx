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
} from '../../../constants/dataTable.js'
import CellValue, { getCellRendererFlags } from '../CellValue.jsx'

describe('getCellRendererFlags', () => {
    test('flags exactly one renderer at a time', () => {
        expect(getCellRendererFlags(RENDERER_COLOR)).toMatchObject({
            isColorCell: true,
            isIconCell: false,
            isDateCell: false,
            isBooleanCell: false,
        })
        expect(getCellRendererFlags(RENDERER_BOOLEAN)).toMatchObject({
            isColorCell: false,
            isBooleanCell: true,
        })
    })

    test('isDateOnlyCell is driven by type, independent of renderer', () => {
        expect(getCellRendererFlags(RENDERER_DATE, TYPE_DATE)).toMatchObject({
            isDateCell: true,
            isDateOnlyCell: true,
        })
        expect(getCellRendererFlags(RENDERER_DATE, 'datetime')).toMatchObject({
            isDateCell: true,
            isDateOnlyCell: false,
        })
    })
})

describe('CellValue', () => {
    test('formats a plain number with the digit group separator', () => {
        render(
            <CellValue value={1234567} keyAnalysisDigitGroupSeparator="COMMA" />
        )
        expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    test('leaves a plain string untouched', () => {
        render(<CellValue value="Bo" />)
        expect(screen.getByText('Bo')).toBeInTheDocument()
    })

    test('renders an em-dash placeholder for a missing value, regardless of renderer', () => {
        render(<CellValue value={null} />)
        expect(screen.getByText('—')).toBeInTheDocument()
    })

    test('renders an em-dash placeholder for an undefined value on a renderer-tagged column', () => {
        render(<CellValue value={undefined} renderer={RENDERER_BOOLEAN} />)
        expect(screen.getByText('—')).toBeInTheDocument()
    })

    test('lowercases a color value instead of formatting it as a number', () => {
        render(<CellValue value="#ABCDEF" renderer={RENDERER_COLOR} />)
        expect(screen.getByText('#abcdef')).toBeInTheDocument()
    })

    test('renders an icon thumbnail for an icon column', () => {
        const { container } = render(
            <CellValue
                value="https://server/icons/marker.png"
                renderer={RENDERER_ICON}
            />
        )
        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            'https://server/icons/marker.png'
        )
    })

    test('formats a boolean-renderer value as Yes/No', () => {
        render(<CellValue value="1" renderer={RENDERER_BOOLEAN} />)
        expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    test('formats an org-unit-hierarchy value as a breadcrumb', () => {
        const idToName = new Map([
            ['country1', 'Country'],
            ['ou1', 'Facility'],
        ])
        render(
            <CellValue
                value="/country1/ou1"
                renderer={RENDERER_ORG_UNIT}
                orgUnitIdToName={idToName}
            />
        )
        expect(screen.getByText('Country / Facility')).toBeInTheDocument()
    })

    test("formats an org-unit-name value as just the feature's own name", () => {
        const idToName = new Map([['ou1', 'Facility']])
        render(
            <CellValue
                value="/country1/ou1"
                renderer={RENDERER_ORG_UNIT_NAME}
                orgUnitIdToName={idToName}
            />
        )
        expect(screen.getByText('Facility')).toBeInTheDocument()
    })
})
