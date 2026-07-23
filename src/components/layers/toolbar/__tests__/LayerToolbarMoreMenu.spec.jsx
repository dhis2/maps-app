import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import LayerToolbarMoreMenu from '../LayerToolbarMoreMenu.jsx'

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

    test('enables Show data table for a server-clustered event layer with no data yet', async () => {
        const store = {
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            layer: 'event',
            serverCluster: true,
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
            expect(
                screen
                    .queryByText('Show data table')
                    .closest('li')
                    .classList.contains('disabled')
            ).toBe(false)
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

    test('renders Duplicate layer item between Edit layer and Remove layer', async () => {
        const store = {
            aggregations: {},
        }

        const layer = {
            id: 'rainbowdash',
            data: 'hasdata',
        }

        const onDuplicate = jest.fn()

        render(
            <Provider store={mockStore(store)}>
                <LayerToolbarMoreMenu
                    layer={layer}
                    onEdit={jest.fn()}
                    onDuplicate={onDuplicate}
                    onRemove={jest.fn()}
                />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Edit layer')).toBeTruthy()
            expect(screen.queryByText('Duplicate layer')).toBeTruthy()
            expect(screen.queryByText('Remove layer')).toBeTruthy()
            // Edit + Duplicate + Remove, no divider (nothing above divider)
            expect(screen.getByRole('menu').children.length).toEqual(3)
        })

        fireEvent.click(screen.getByText('Duplicate layer'))
        expect(onDuplicate).toHaveBeenCalledTimes(1)
    })

    test('renders disabled menu items if there was an error', async () => {
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
                    hasError={true}
                />
            </Provider>
        )

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))

        await waitFor(() => {
            expect(screen.queryByText('Show data table')).toBeTruthy()
            expect(
                screen
                    .queryByText('Show data table')
                    .closest('li')
                    .classList.contains('disabled')
            ).toBe(true)

            expect(screen.queryByText('Download data')).toBeTruthy()
            expect(
                screen
                    .queryByText('Download data')
                    .closest('li')
                    .classList.contains('disabled')
            ).toBe(true)
            expect(screen.queryByText('Edit layer')).toBeTruthy()
            expect(
                screen
                    .queryByText('Edit layer')
                    .closest('li')
                    .classList.contains('disabled')
            ).toBe(false)

            expect(screen.queryByText('Remove layer')).toBeTruthy()
            expect(
                screen
                    .queryByText('Remove layer')
                    .closest('li')
                    .classList.contains('disabled')
            ).toBe(false)
            // confirm the divider is present (1 more list item)
            expect(screen.getByRole('menu').children.length).toEqual(5)

            expect(screen.queryByText('Open as chart')).toBeNull()
        })
    })
})
