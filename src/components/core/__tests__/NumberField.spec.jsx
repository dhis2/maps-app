import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import NumberField from '../NumberField.jsx'

describe('NumberField', () => {
    it('displays the given value', () => {
        render(<NumberField label="Radius" value={5} onChange={jest.fn()} />)

        expect(screen.getByRole('spinbutton')).toHaveValue(5)
    })

    it('displays an empty value as an empty string', () => {
        render(
            <NumberField
                label="Radius"
                value={undefined}
                onChange={jest.fn()}
            />
        )

        expect(screen.getByRole('spinbutton')).toHaveValue(null)
    })

    it('calls onChange with the parsed number on blur', () => {
        const onChange = jest.fn()
        render(<NumberField label="Radius" value={5} onChange={onChange} />)

        const input = screen.getByRole('spinbutton')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '10' } })
        fireEvent.blur(input)

        expect(onChange).toHaveBeenCalledWith(10)
    })

    // Number.isNaN doesn't coerce, so a non-numeric string passed directly as
    // the `value` prop (not something a user can type into a type="number"
    // input) reaches the blur handler's Number(inputValue) unconverted.
    it('calls onChange with NaN when the value prop is not numeric and the field is blurred untouched', () => {
        const onChange = jest.fn()
        render(
            <NumberField
                label="Radius"
                value="not-a-number"
                onChange={onChange}
            />
        )

        const input = screen.getByRole('spinbutton')
        fireEvent.focus(input)
        fireEvent.blur(input)

        expect(onChange).toHaveBeenCalledWith(Number.NaN)
    })

    it('does not overwrite an in-progress edit when the value prop changes elsewhere while focused', () => {
        const { rerender } = render(
            <NumberField label="Radius" value={5} onChange={jest.fn()} />
        )

        const input = screen.getByRole('spinbutton')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: '7' } })

        // Simulates a parent re-render caused by something else while the
        // user is mid-edit (e.g. a sibling field's change) - the value prop
        // itself moved from 5 to 6, but the focused input keeps showing 7.
        rerender(<NumberField label="Radius" value={6} onChange={jest.fn()} />)

        expect(input).toHaveValue(7)
    })

    it('syncs the display value from an external reset while not focused', () => {
        const { rerender } = render(
            <NumberField label="Radius" value={5} onChange={jest.fn()} />
        )

        rerender(<NumberField label="Radius" value={9} onChange={jest.fn()} />)

        expect(screen.getByRole('spinbutton')).toHaveValue(9)
    })
})
