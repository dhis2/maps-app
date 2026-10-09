import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import TableComponents, {
    EmptyPlaceholder,
} from '../TableVirtuosoComponents.jsx'

const renderPlaceholder = (context) =>
    render(
        <table>
            <EmptyPlaceholder context={context} />
        </table>
    )

describe('EmptyPlaceholder', () => {
    test('shows the server-cluster action when showServerClusterAction is true', () => {
        const onForceClientCluster = jest.fn()
        renderPlaceholder({
            showServerClusterAction: true,
            onForceClientCluster,
        })

        expect(
            screen.getByText(
                "Event details aren't available while this layer is clustered on the server"
            )
        ).toBeTruthy()

        fireEvent.click(screen.getByText('Show event details'))
        expect(onForceClientCluster).toHaveBeenCalledTimes(1)

        expect(screen.queryByText('No features match your filters')).toBeNull()
        expect(screen.queryByText('No results found')).toBeNull()
    })

    test('shows the clear-filters action when filters produced zero rows', () => {
        const onClearFilters = jest.fn()
        renderPlaceholder({
            showServerClusterAction: false,
            totalCount: 10,
            hasActiveFilters: true,
            onClearFilters,
        })

        expect(screen.getByText('No features match your filters')).toBeTruthy()

        fireEvent.click(screen.getByText('Clear filters'))
        expect(onClearFilters).toHaveBeenCalledTimes(1)

        expect(screen.queryByText('Show event details')).toBeNull()
    })

    test('shows plain "No results found" when there is no data at all', () => {
        renderPlaceholder({
            showServerClusterAction: false,
            totalCount: 0,
            hasActiveFilters: false,
        })

        expect(screen.getByText('No results found')).toBeTruthy()
        expect(screen.queryByText('Show event details')).toBeNull()
        expect(screen.queryByText('No features match your filters')).toBeNull()
    })
})

describe('TableRow', () => {
    const TableRow = TableComponents.TableRow

    const renderRow = () =>
        render(
            <table>
                <tbody>
                    <TableRow
                        context={{
                            onMouseEnter: jest.fn(),
                            onMouseLeave: jest.fn(),
                            onContextMenu: jest.fn(),
                            onRowClick: jest.fn(),
                            onRowDoubleClick: jest.fn(),
                        }}
                        item={[]}
                    >
                        <td>Bombali Sebora</td>
                    </TableRow>
                </tbody>
            </table>
        )

    test('prevents the default mousedown action for a ctrl-click, to avoid triggering native text selection', () => {
        renderRow()
        const notCancelled = fireEvent.mouseDown(
            screen.getByTestId('dhis2-uicore-datatablerow'),
            {
                ctrlKey: true,
            }
        )
        expect(notCancelled).toBe(false)
    })

    test('prevents the default mousedown action for a shift-click', () => {
        renderRow()
        const notCancelled = fireEvent.mouseDown(
            screen.getByTestId('dhis2-uicore-datatablerow'),
            {
                shiftKey: true,
            }
        )
        expect(notCancelled).toBe(false)
    })

    test('leaves a plain mousedown alone', () => {
        renderRow()
        const notCancelled = fireEvent.mouseDown(
            screen.getByTestId('dhis2-uicore-datatablerow')
        )
        expect(notCancelled).toBe(true)
    })
})
