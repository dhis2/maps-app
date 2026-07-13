import { render } from '@testing-library/react'
import React from 'react'
import ColorPicker from '../ColorPicker.jsx'

describe('ColorPicker', () => {
    it('uses the default 24px chevron at the default size', () => {
        const { container } = render(
            <ColorPicker color="#FFC800" onChange={jest.fn()} />
        )
        expect(container.querySelector('svg').getAttribute('width')).toBe('24')
    })

    it('uses a compact 16px chevron when height is small', () => {
        const { container } = render(
            <ColorPicker
                color="#FFC800"
                height={20}
                width={20}
                onChange={jest.fn()}
            />
        )
        expect(container.querySelector('svg').getAttribute('width')).toBe('16')
    })

    it('right-aligns the chevron by default (unchanged look for existing pickers)', () => {
        const { container } = render(
            <ColorPicker color="#FFC800" onChange={jest.fn()} />
        )
        expect(container.querySelector('span').className).toContain('icon')
        expect(container.querySelector('span').className).not.toContain(
            'iconCentered'
        )
    })

    it('centers the chevron only when centerIcon is set (data-table swatch)', () => {
        const { container } = render(
            <ColorPicker color="#FFC800" onChange={jest.fn()} centerIcon />
        )
        expect(container.querySelector('span').className).toContain(
            'iconCentered'
        )
    })

    it('renders an empty/dashed swatch instead of a solid fill when no color is set', () => {
        const { container } = render(
            <ColorPicker color={null} onChange={jest.fn()} />
        )
        const label = container.querySelector('label')
        expect(label.className).toContain('unset')
        expect(label.style.backgroundColor).toBe('')
    })

    it('still gives the native color input a real value when unset', () => {
        const { container } = render(
            <ColorPicker color={null} onChange={jest.fn()} />
        )
        expect(container.querySelector('input').value).not.toBe('')
    })

    it('renders a solid fill (not the unset style) once a color is set', () => {
        const { container } = render(
            <ColorPicker color="#FF0000" onChange={jest.fn()} />
        )
        const label = container.querySelector('label')
        expect(label.className).not.toContain('unset')
        expect(label.style.backgroundColor).toBe('rgb(255, 0, 0)')
    })
})
