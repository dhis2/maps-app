import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { EVENT_LAYER } from '../../../constants/layers.js'
import LayersLoader from '../LayersLoader.jsx'

const mockStore = configureMockStore()

const id = 'thelayerid'

jest.mock(
    '../LayerLoader.jsx',
    () =>
        function MockLayerLoader() {
            return <div>LayerLoader</div>
        }
)

const testCases = [
    {
        testTitle: 'renders 0 layerloaders if no layers',
        store: {
            map: {
                mapViews: [],
            },
            dataTable: null,
        },
    },
    {
        testTitle: 'renders 0 layerloaders if currently loading the layer',
        store: {
            map: {
                mapViews: [{ isLoading: true, isLoaded: false }],
            },
            dataTable: null,
        },
    },
    {
        testTitle:
            'renders 0 layerloaders if currently loading regardless of whether loaded already',
        store: {
            map: {
                mapViews: [
                    {
                        isLoading: true,
                        isLoaded: true,
                    },
                ],
            },
            dataTable: null,
        },
    },
    {
        testTitle:
            'renders 1 layerloader if not currently loading and not loaded',
        store: {
            map: {
                mapViews: [
                    {
                        isLoading: false,
                        isLoaded: false,
                    },
                ],
            },
            dataTable: null,
        },
    },
    {
        testTitle:
            'renders 1 layerloader if not currently loading and is loaded but need extended data',
        store: {
            map: {
                mapViews: [
                    {
                        id,
                        layer: EVENT_LAYER,
                        isLoading: false,
                        isLoaded: true,
                        isExtended: false,
                        serverCluster: false,
                    },
                ],
            },
            dataTable: id,
        },
    },
    {
        testTitle:
            'renders 0 layerloaders if not currently loading and loaded and extended data also loaded',
        store: {
            map: {
                mapViews: [
                    {
                        id,
                        layer: EVENT_LAYER,
                        isLoading: false,
                        isLoaded: true,
                        isExtended: true,
                        serverCluster: false,
                    },
                ],
            },
            dataTable: id,
        },
    },
]

describe('LayersLoader', () => {
    testCases.forEach(({ testTitle, store }) => {
        it(testTitle, () => {
            const { container } = render(
                <Provider store={mockStore(store)}>
                    <LayersLoader />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
