import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Checkbox from '../Checkbox.jsx'

describe('Checkbox', () => {
    it('renders unchecked by default', () => {
        render(<Checkbox label="Show label" onChange={jest.fn()} />)

        expect(screen.getByRole('checkbox')).not.toBeChecked()
        expect(screen.getByText('Show label')).toBeInTheDocument()
    })

    it('renders checked when checked is true', () => {
        render(
            <Checkbox label="Show label" checked={true} onChange={jest.fn()} />
        )

        expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('calls onChange with the new checked value', () => {
        const onChange = jest.fn()
        render(
            <Checkbox label="Show label" checked={false} onChange={onChange} />
        )

        fireEvent.click(screen.getByRole('checkbox'))

        expect(onChange).toHaveBeenCalledWith(true)
    })

    it('renders a tooltip icon only when a tooltip is given', () => {
        const { container, rerender } = render(
            <Checkbox label="Show label" onChange={jest.fn()} />
        )
        const iconCountWithoutTooltip = container.querySelectorAll('svg').length

        rerender(
            <Checkbox
                label="Show label"
                onChange={jest.fn()}
                tooltip="More info"
            />
        )

        expect(container.querySelectorAll('svg').length).toBeGreaterThan(
            iconCountWithoutTooltip
        )
    })
})
