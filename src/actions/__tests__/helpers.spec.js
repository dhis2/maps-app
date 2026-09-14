import { errorActionCreator } from '../helpers.js'

describe('errorActionCreator', () => {
    it('creates an action with the given type and stringified error', () => {
        const action = errorActionCreator('SOME_ERROR')(new Error('Oops'))

        expect(action).toEqual({
            type: 'SOME_ERROR',
            error: 'Error: Oops',
        })
    })

    it('stringifies non-Error values', () => {
        const action = errorActionCreator('SOME_ERROR')('Something went wrong')

        expect(action).toEqual({
            type: 'SOME_ERROR',
            error: 'Something went wrong',
        })
    })
})
