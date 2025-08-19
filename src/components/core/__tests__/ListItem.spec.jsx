import { render } from '@testing-library/react'
import React from 'react'
import ListItem from '../ListItem.jsx'

describe('Drawer', () => {
    it('should not render if children is missing', () => {
        const { container } = render(<ListItem label="Item 1 in list" />)
        expect(container).toMatchSnapshot()
    })

    it('should render if a value is passed as children', () => {
        const { container } = render(
            <ListItem label="Item 1 in list">123</ListItem>
        )
        expect(container).toMatchSnapshot()
    })

    it('should change value if formatter is passed', () => {
        const formatter = jest.fn((value) => ++value)
        const { container } = render(
            <ListItem label="Item 1 in list" formatter={formatter}>
                123
            </ListItem>
        )
        expect(container).toMatchSnapshot()
    })
})
