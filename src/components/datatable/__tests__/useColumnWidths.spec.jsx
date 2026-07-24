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

// A stable reference: the hook re-measures whenever `headers` changes
// identity, so passing a literal from the test body would spuriously
// reset the measurement on every rerender
const HEADERS = [{ dataKey: 'a' }, { dataKey: 'b' }]

const Harness = ({ availableWidth, error, widths, onColumnWidths }) => {
    const { headerRowRef, columnWidths } = useColumnWidths({
        availableWidth,
        headers: HEADERS,
        error,
    })
    onColumnWidths(columnWidths)
    return (
        <table>
            <tbody>
                <tr ref={headerRowRef}>
                    <td data-width="76" /> {/* checkbox column, skipped */}
                    {widths.map((w, i) => (
                        <td key={i} data-width={w} />
                    ))}
                </tr>
            </tbody>
        </table>
    )
}

Harness.propTypes = {
    widths: PropTypes.arrayOf(PropTypes.number).isRequired,
    onColumnWidths: PropTypes.func.isRequired,
    availableWidth: PropTypes.number,
    error: PropTypes.bool,
}

describe('useColumnWidths - MIN_COLUMN_WIDTH floor', () => {
    it('floors a narrower-than-minimum measured column up to the minimum, leaving wider columns untouched', () => {
        let latestWidths
        render(
            <Harness
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
            <Harness
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
                <Harness
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
