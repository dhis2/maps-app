import { render } from '@testing-library/react'
import React from 'react'
import Drawer from '../Drawer.jsx'

describe('Drawer', () => {
    it('should render a right drawer by default', () => {
        const { container } = render(<Drawer />)
        expect(container).toMatchSnapshot()
    })

    it('should render a left drawer if left position', () => {
        const { container } = render(<Drawer position="left" />)
        expect(container).toMatchSnapshot()
    })

    it('should include class name if passed', () => {
        const { container } = render(
            <Drawer position="left" className="myclass" />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render children', () => {
        const { container } = render(
            <Drawer position="left" dataTest="the-data-test-drawer">
                <h4>Title</h4>
                <img src="" />
            </Drawer>
        )

        expect(container).toMatchSnapshot()
    })
})
