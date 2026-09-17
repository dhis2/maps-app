import { renderHook } from '@testing-library/react'
import usePrevious from '../usePrevious.js'

describe('usePrevious', () => {
    it('returns undefined on the first render', () => {
        const { result } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 'a' },
        })

        expect(result.current).toBeUndefined()
    })

    it('returns the value from the previous render after a re-render', () => {
        const { result, rerender } = renderHook(
            ({ value }) => usePrevious(value),
            { initialProps: { value: 'a' } }
        )

        rerender({ value: 'b' })
        expect(result.current).toBe('a')

        rerender({ value: 'c' })
        expect(result.current).toBe('b')
    })
})
