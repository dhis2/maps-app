import { render, act } from '@testing-library/react'
import PropTypes from 'prop-types'
import React from 'react'
import { useColumnWidths } from '../useColumnWidths.js'

let rafCallbacks

beforeEach(() => {
    rafCallbacks = []
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallbacks.push(cb)
        return rafCallbacks.length
    })
    jest.spyOn(
        HTMLElement.prototype,
        'getBoundingClientRect'
    ).mockImplementation(function () {
        return { width: Number(this.dataset.width) || 0 }
    })
})

afterEach(() => {
    global.requestAnimationFrame.mockRestore()
    HTMLElement.prototype.getBoundingClientRect.mockRestore()
})

const flushRaf = () => {
    while (rafCallbacks.length) {
        rafCallbacks.shift()()
    }
}

const HEADERS = [{ dataKey: 'a' }, { dataKey: 'b' }]

const MeasuredTable = ({
    availableWidth,
    error,
    widths,
    onColumnWidths,
    headers = HEADERS,
}) => {
    const { headerRowRef, columnWidths } = useColumnWidths({
        availableWidth,
        headers,
        error,
    })
    onColumnWidths(columnWidths)
    return (
        <table>
            <tbody>
                <tr ref={headerRowRef}>
                    {widths.map((w, i) => (
                        <td key={i} data-width={w} />
                    ))}
                </tr>
            </tbody>
        </table>
    )
}

MeasuredTable.propTypes = {
    widths: PropTypes.arrayOf(PropTypes.number).isRequired,
    onColumnWidths: PropTypes.func.isRequired,
    availableWidth: PropTypes.number,
    error: PropTypes.bool,
    headers: PropTypes.array,
}

describe('useColumnWidths - MIN_COLUMN_WIDTH floor', () => {
    it('floors a narrower-than-minimum measured column up to the minimum, leaving wider columns untouched', () => {
        let latestWidths
        render(
            <MeasuredTable
                availableWidth={500}
                widths={[20, 150]}
                onColumnWidths={(w) => {
                    latestWidths = w
                }}
            />
        )
        act(() => {
            flushRaf()
        })
        expect(latestWidths).toEqual([100, 150])
    })

    it('the floored width stays the resize-clamp floor on a later shrink, instead of scaling down further', () => {
        let latestWidths
        const { rerender } = render(
            <MeasuredTable
                availableWidth={500}
                widths={[20, 150]}
                onColumnWidths={(w) => {
                    latestWidths = w
                }}
            />
        )
        act(() => {
            flushRaf()
        })
        expect(latestWidths).toEqual([100, 150])

        act(() => {
            rerender(
                <MeasuredTable
                    availableWidth={100}
                    widths={[20, 150]}
                    onColumnWidths={(w) => {
                        latestWidths = w
                    }}
                />
            )
        })
        expect(latestWidths).toEqual([100, 150])
    })
})

describe('useColumnWidths - re-measuring', () => {
    const renderWithHeaders = (headers) => {
        const calls = []
        const props = {
            availableWidth: 500,
            widths: [120, 150],
            onColumnWidths: (w) => calls.push(w),
        }
        const view = render(<MeasuredTable {...props} headers={headers} />)
        act(() => {
            flushRaf()
        })
        const rerenderWith = (nextHeaders) => {
            calls.length = 0
            act(() => {
                view.rerender(
                    <MeasuredTable {...props} headers={nextHeaders} />
                )
            })
            return calls
        }
        return rerenderWith
    }

    it('keeps the widths when the same columns come in a new list, as on each timeline period', () => {
        const rerenderWith = renderWithHeaders([
            { dataKey: 'a', name: 'A' },
            { dataKey: 'b', name: 'B' },
        ])

        const calls = rerenderWith([
            { dataKey: 'a', name: 'A' },
            { dataKey: 'b', name: 'B' },
        ])

        expect(calls).not.toContainEqual([])
    })

    it('re-measures when a column is added or renamed', () => {
        const rerenderWith = renderWithHeaders([
            { dataKey: 'a', name: 'A' },
            { dataKey: 'b', name: 'B' },
        ])

        expect(
            rerenderWith([
                { dataKey: 'a', name: 'A' },
                { dataKey: 'b', name: 'B' },
                { dataKey: 'c', name: 'C' },
            ])
        ).toContainEqual([])
        expect(
            rerenderWith([
                { dataKey: 'a', name: 'A2' },
                { dataKey: 'b', name: 'B' },
                { dataKey: 'c', name: 'C' },
            ])
        ).toContainEqual([])
    })
})
