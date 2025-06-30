import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import LayerToolbar from '../LayerToolbar.jsx'

/* eslint-disable react/prop-types */
jest.mock('@dhis2/ui', () => {
    const originalModule = jest.requireActual('@dhis2/ui')

    return {
        __esModule: true,
        ...originalModule,
        Tooltip: function Tooltip({ children }) {
            return <div>{children}</div>
        },
        IconView24: function IconView24() {
            return <div>IconView24</div>
        },
        IconViewOff24: function IconViewOff24() {
            return <div>IconViewOff24</div>
        },
    }
})

jest.mock('../LayerToolbarMoreMenu.jsx', () => {
    return function LayerToolbarMoreMenu() {
        return <div>LayerToolbarMoreMenu</div>
    }
})
/* eslint-enable react/prop-types */

const props = {
    opacity: 0,
    isVisible: true,
    toggleLayerVisibility: jest.fn(),
    onOpacityChange: jest.fn(),
}

describe('LayerToolbar', () => {
    it('Should render only a visibility toggle and opacity slider', () => {
        const { container } = render(
            <LayerToolbar {...props} isVisible={true} />
        )
        expect(container).toMatchSnapshot()
    })

    it('Should show SvgViewOff24 when not visible', () => {
        const { container } = render(
            <LayerToolbar {...props} isVisible={false} />
        )
        expect(container).toMatchSnapshot()
    })

    it('Should call toggleLayerVisibility callback on button press', async () => {
        const toggleVisibleFn = jest.fn()
        const { container } = render(
            <LayerToolbar {...props} toggleLayerVisibility={toggleVisibleFn} />
        )

        await fireEvent.click(
            container.querySelector('[data-test="visibilitybutton"]')
        )
        expect(toggleVisibleFn).toHaveBeenCalledTimes(1)
    })

    it('Should render edit button', () => {
        const { container } = render(
            <LayerToolbar {...props} onEdit={jest.fn()} />
        )
        expect(container).toMatchSnapshot()
    })

    it('Should call onEdit callback on button press', async () => {
        const toggleVisibleFn = jest.fn()
        const editFn = jest.fn()

        const { container } = render(
            <LayerToolbar
                {...props}
                onEdit={editFn}
                toggleLayerVisibility={toggleVisibleFn}
            />
        )

        await fireEvent.click(
            container.querySelector('[data-test="layer-edit-button"]')
        )
        expect(editFn).toHaveBeenCalledTimes(1)
        expect(toggleVisibleFn).not.toHaveBeenCalled()

        await fireEvent.click(
            container.querySelector('[data-test="visibilitybutton"]')
        )
        expect(toggleVisibleFn).toHaveBeenCalledTimes(1)
        expect(editFn).toHaveBeenCalledTimes(1)
    })
})
