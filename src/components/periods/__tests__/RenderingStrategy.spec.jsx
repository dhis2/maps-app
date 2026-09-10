import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import RenderingStrategy from '../RenderingStrategy.jsx'

const mockStore = configureMockStore()

const renderStrategy = (mapViews) => {
    const store = mockStore({ map: { mapViews } })
    return render(
        <Provider store={store}>
            <RenderingStrategy
                layerId="layer1"
                periods={[]}
                onChange={jest.fn()}
            />
        </Provider>
    )
}

describe('RenderingStrategy — reference org unit layer exclusion', () => {
    test('does not disable Split when the only other map view is the Combined reference layer', () => {
        renderStrategy([
            { id: 'layer1' },
            { id: 'ref1', layer: 'combinedTableRef' },
        ])

        expect(screen.getByRole('radio', { name: /Split/i })).not.toBeDisabled()
    })

    test('still disables Split when a real other layer is present', () => {
        renderStrategy([{ id: 'layer1' }, { id: 'layer2' }])

        expect(screen.getByRole('radio', { name: /Split/i })).toBeDisabled()
    })
})
