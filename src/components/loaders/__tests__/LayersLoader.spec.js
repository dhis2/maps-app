import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import LayersLoader from '../LayersLoader.js'

const mockStore = configureMockStore()

jest.mock(
    '../LayerLoader.js',
    () =>
        function MockLayerLoader() {
            return <div>LayerLoader</div>
        }
)

const testCases = [
    {
        testTitle: 'renders 0 layers if no layers',
        store: {
            map: {
                mapViews: [],
            },
        },
    },
    {
        testTitle: 'renders 0 layers if currently loading the layer',
        store: {
            map: {
                mapViews: [{ isLoading: true, isLoaded: false }],
            },
        },
    },
    {
        testTitle:
            'renders 0 layers if currently loading regardless of whether loaded already',
        store: {
            map: {
                mapViews: [
                    {
                        isLoading: true,
                        isLoaded: true,
                    },
                ],
            },
        },
    },
    {
        testTitle: 'renders 1 layer if not currently loading and not loaded',
        store: {
            map: {
                mapViews: [
                    {
                        isLoading: false,
                        isLoaded: false,
                    },
                ],
            },
        },
    },
    {
        testTitle:
            'renders 1 layer if not currently loading and is loaded but need extended data',
        store: {
            map: {
                mapViews: [
                    {
                        isLoading: false,
                        isLoaded: true,
                        showDataTable: true,
                        isExtended: false,
                    },
                ],
            },
        },
    },
    {
        testTitle:
            'renders 0 layers if not currently loading and loaded and extended data also loaded',
        store: {
            map: {
                mapViews: [
                    {
                        isLoading: false,
                        isLoaded: true,
                        showDataTable: true,
                        isExtended: true,
                    },
                ],
            },
        },
    },
]

describe('LayersLoader', () => {
    testCases.forEach(({ testTitle, store }) => {
        test(testTitle, () => {
            const { container } = render(
                <Provider store={mockStore(store)}>
                    <LayersLoader />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
