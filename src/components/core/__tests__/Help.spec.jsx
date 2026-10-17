import { render, screen } from '@testing-library/react'
import React from 'react'
import Help from '../Help.jsx'

describe('Help', () => {
    it('renders its children next to an info icon', () => {
        const { container } = render(<Help>Some help text</Help>)

        expect(screen.getByText('Some help text')).toBeInTheDocument()
        expect(container.querySelector('svg')).toBeInTheDocument()
    })
})
