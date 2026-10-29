import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
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

const mockStore = configureMockStore()

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

    describe('data table button', () => {
        const layer = { id: 'layer1', layer: 'thematic', data: [{}] }

        const renderWithStore = (dataTable, extraProps = {}) =>
            render(
                <Provider store={mockStore({ dataTable })}>
                    <LayerToolbar
                        {...props}
                        layer={layer}
                        toggleDataTable={jest.fn()}
                        {...extraProps}
                    />
                </Provider>
            )

        const getButton = (container) =>
            container.querySelector('[data-test="layer-data-table-button"]')

        it('is not rendered without toggleDataTable', () => {
            const { container } = render(
                <LayerToolbar {...props} layer={layer} />
            )
            expect(getButton(container)).toBeNull()
        })

        it('is not pressed when the layer is not in the data table', () => {
            const { container } = renderWithStore(null)
            expect(getButton(container).getAttribute('aria-pressed')).toBe(
                'false'
            )
            expect(getButton(container).getAttribute('aria-label')).toBe(
                'Show data table'
            )
        })

        it('is pressed when the layer is in the data table', () => {
            const { container } = renderWithStore('layer1')
            expect(getButton(container).getAttribute('aria-pressed')).toBe(
                'true'
            )
            expect(getButton(container).getAttribute('aria-label')).toBe(
                'Hide data table'
            )
        })

        it('calls toggleDataTable on click', () => {
            const toggleDataTable = jest.fn()
            const { container } = renderWithStore(null, { toggleDataTable })
            fireEvent.click(getButton(container))
            expect(toggleDataTable).toHaveBeenCalledTimes(1)
        })

        it('is disabled when the layer has an error', () => {
            const { container } = renderWithStore(null, { hasError: true })
            expect(getButton(container).disabled).toBe(true)
        })
    })
})
