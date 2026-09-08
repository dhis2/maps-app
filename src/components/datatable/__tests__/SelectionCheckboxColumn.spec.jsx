import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { SelectionCheckboxCell } from '../SelectionCheckboxColumn.jsx'

const renderCell = (isSelected, onToggle = jest.fn()) => {
    render(
        <table>
            <tbody>
                <tr>
                    <SelectionCheckboxCell
                        isSelected={isSelected}
                        onToggle={onToggle}
                    />
                </tr>
            </tbody>
        </table>
    )
    return screen.getByRole('checkbox')
}

describe('SelectionCheckboxCell', () => {
    test('calls onToggle with the click event, carrying shiftKey, on a shift-click', () => {
        const onToggle = jest.fn()
        const checkbox = renderCell(false, onToggle)

        fireEvent.click(checkbox, { shiftKey: true })

        expect(onToggle).toHaveBeenCalledTimes(1)
        expect(onToggle.mock.calls[0][0]).toMatchObject({ shiftKey: true })
    })

    test('calls onToggle on a plain click, with shiftKey false', () => {
        const onToggle = jest.fn()
        const checkbox = renderCell(false, onToggle)

        fireEvent.click(checkbox)

        expect(onToggle).toHaveBeenCalledTimes(1)
        expect(onToggle.mock.calls[0][0]).toMatchObject({ shiftKey: false })
    })

    test('lets the native click default through, so the browser keeps its own checked state in sync', () => {
        const checkbox = renderCell(false)

        const notCancelled = fireEvent.click(checkbox)

        expect(notCancelled).toBe(true)
    })
})
