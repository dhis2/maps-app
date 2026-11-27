import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { EmptyPlaceholder } from '../TableVirtuosoComponents.jsx'

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

        expect(screen.getByText("Event details aren't available")).toBeTruthy()
        expect(
            screen.getByText('This layer is clustered on the server.')
        ).toBeTruthy()

        fireEvent.click(screen.getByText('Show event details'))
        expect(onForceClientCluster).toHaveBeenCalledTimes(1)

        expect(screen.queryByText('No matching rows')).toBeNull()
        expect(screen.queryByText('No data to show')).toBeNull()
    })

    test('shows the clear-filters action when filters produced zero rows', () => {
        const onClearFilters = jest.fn()
        renderPlaceholder({
            showServerClusterAction: false,
            totalCount: 10,
            hasActiveFilters: true,
            onClearFilters,
        })

        expect(screen.getByText('No matching rows')).toBeTruthy()
        expect(
            screen.getByText('Try changing or clearing your filters.')
        ).toBeTruthy()

        fireEvent.click(screen.getByText('Clear filters'))
        expect(onClearFilters).toHaveBeenCalledTimes(1)

        expect(screen.queryByText('Show event details')).toBeNull()
    })

    test('shows the layer’s no-data message when there is no data at all, without a button', () => {
        renderPlaceholder({
            showServerClusterAction: false,
            totalCount: 0,
            hasActiveFilters: false,
            noDataMessage: {
                title: 'No data to show',
                description: 'This external layer has no features.',
            },
        })

        expect(screen.getByText('No data to show')).toBeTruthy()
        expect(
            screen.getByText('This external layer has no features.')
        ).toBeTruthy()
        expect(screen.queryByRole('button')).toBeNull()
    })
})
