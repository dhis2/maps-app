import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import SortableColumnHeader from '../SortableColumnHeader.jsx'

const ACTIVE_FILL = 'var(--colors-teal600)'
const UP_ARROW = '4 7 12 7 8 2'
const DOWN_ARROW = '4 9 12 9 8 14'

const renderHeader = (props) =>
    render(
        <table>
            <thead>
                <tr>
                    <SortableColumnHeader
                        name="Value"
                        dataKey="rawValue"
                        onSort={jest.fn()}
                        {...props}
                    />
                </tr>
            </thead>
        </table>
    )

const activeArrows = (container) =>
    [...container.querySelectorAll('polygon')]
        .filter((p) => p.getAttribute('fill') === ACTIVE_FILL)
        .map((p) => p.getAttribute('points'))

describe('SortableColumnHeader', () => {
    test.each([
        ['asc', [UP_ARROW]],
        ['desc', [DOWN_ARROW]],
        [null, []],
    ])(
        'highlights the arrow of the column sort direction %p',
        (direction, arrows) => {
            const { container } = renderHeader({ sortDirection: direction })
            expect(activeArrows(container)).toEqual(arrows)
        }
    )

    test('sorts by its own data key when its sort button is clicked', () => {
        const onSort = jest.fn()
        renderHeader({ onSort })
        fireEvent.click(screen.getByRole('button', { name: 'Sort by Value' }))
        expect(onSort).toHaveBeenCalledWith({ name: 'rawValue' })
    })
})
