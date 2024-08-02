import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import LayerToolbarMoreMenu from '../LayerToolbarMoreMenu.js'

const mockStore = configureMockStore()

describe('LayerToolbarMoreMenu', () => {
    test('does not render if no props passed', () => {
        const store = {}

        const { container } = render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders menu with Remove layer only', async () => {
        const store = {
            dataTable: null,
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            data: 'hasdata',
        }

        render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu layer={layer} onRemove={jest.fn()} />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Remove layer')).toBeTruthy()
            // confirm the divider is not present
            expect(screen.getByRole('menu').children.length).toEqual(1)

            expect(screen.queryByText('Show data table')).toBeNull()
            expect(screen.queryByText('Open as chart')).toBeNull()
            expect(screen.queryByText('Download data')).toBeNull()
            expect(screen.queryByText('Edit layer')).toBeNull()
        })
    })

    test('renders menu with Remove layer and Edit layer options', async () => {
        const store = {
            dataTable: null,
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            data: 'hasdata',
        }

        render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu
                    layer={layer}
                    onRemove={jest.fn()}
                    onEdit={jest.fn()}
                />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Edit layer')).toBeTruthy()
            expect(screen.queryByText('Remove layer')).toBeTruthy()
            // confirm the divider is not present
            expect(screen.getByRole('menu').children.length).toEqual(2)

            expect(screen.queryByText('Show data table')).toBeNull()
            expect(screen.queryByText('Open as chart')).toBeNull()
            expect(screen.queryByText('Download data')).toBeNull()
        })
    })

    test('renders two MenuItems with no divider if only passed toggleDataTable and downloadData', async () => {
        const store = {
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            data: 'hasdata',
        }

        render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu
                    layer={layer}
                    toggleDataTable={jest.fn()}
                    downloadData={jest.fn()}
                />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Show data table')).toBeTruthy()
            expect(screen.queryByText('Download data')).toBeTruthy()
            // confirm the divider is not present
            expect(screen.getByRole('menu').children.length).toEqual(2)

            expect(screen.queryByText('Open as chart')).toBeNull()
            expect(screen.queryByText('Edit layer')).toBeNull()
            expect(screen.queryByText('Remove layer')).toBeNull()
        })
    })

    test('renders only toggleDataTable menu', async () => {
        const store = {
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            data: 'hasdata',
        }

        render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu
                    layer={layer}
                    toggleDataTable={jest.fn()}
                />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Show data table')).toBeTruthy()
            expect(screen.getByRole('menu').children.length).toEqual(1)

            expect(screen.queryByText('Open as chart')).toBeNull()
            expect(screen.queryByText('Download data')).toBeNull()
            expect(screen.queryByText('Edit layer')).toBeNull()
            expect(screen.queryByText('Remove layer')).toBeNull()
        })
    })

    test('renders three MenuItems WITH divider if passed toggleDataTable, onEdit, and onRemove', async () => {
        const store = {
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            data: 'hasdata',
        }

        render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu
                    layer={layer}
                    toggleDataTable={jest.fn()}
                    onRemove={jest.fn()}
                    onEdit={jest.fn()}
                />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Show data table')).toBeTruthy()
            expect(screen.queryByText('Edit layer')).toBeTruthy()
            expect(screen.queryByText('Remove layer')).toBeTruthy()

            // confirm the divider is present (1 more list item)
            expect(screen.getByRole('menu').children.length).toEqual(4)

            expect(screen.queryByText('Open as chart')).toBeNull()
            expect(screen.queryByText('Download data')).toBeNull()
        })
    })

    test('renders four MenuItems WITH divider if passed toggleDataTable, downloadData, onEdit, and onRemove', async () => {
        const store = {
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            data: 'hasdata',
        }

        render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu
                    layer={layer}
                    toggleDataTable={jest.fn()}
                    onRemove={jest.fn()}
                    onEdit={jest.fn()}
                    downloadData={jest.fn()}
                />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Show data table')).toBeTruthy()
            expect(screen.queryByText('Download data')).toBeTruthy()
            expect(screen.queryByText('Edit layer')).toBeTruthy()
            expect(screen.queryByText('Remove layer')).toBeTruthy()
            // confirm the divider is present (1 more list item)
            expect(screen.getByRole('menu').children.length).toEqual(5)

            expect(screen.queryByText('Open as chart')).toBeNull()
        })
    })
})
