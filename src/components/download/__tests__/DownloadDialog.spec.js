import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { downloadSupport } from '../../../util/export-image.js'
import DownloadDialog from '../DownloadDialog.js'

const mockStore = configureMockStore()

jest.mock('../../../util/export-image', () => ({
    downloadSupport: jest.fn(),
    downloadMapImage: jest.fn(),
}))

jest.mock('../../../actions/download.js', () => {
    return {
        toggleDownloadDialog: jest
            .fn()
            .mockReturnValue({ type: 'DOWNLOAD_DIALOG_TOGGLE' }),
    }
})

/* eslint-disable react/prop-types */
jest.mock('@dhis2/ui', () => {
    const originalModule = jest.requireActual('@dhis2/ui')

    return {
        __esModule: true,
        ...originalModule,
        Modal: function Mock(props) {
            return <div className="ui-Modal">{props.children}</div>
        },
        Button: function Mock({ children }) {
            return <div className="ui-Button">{children}</div>
        },
        ButtonStrip: function Mock({ children }) {
            return <div className="ui-ButtonStrip">{children}</div>
        },
        ModalActions: function Mock({ children }) {
            return <div className="ui-ModalActions">{children}</div>
        },
        ModalContent: function Mock({ children }) {
            return <div className="ui-ModalContent">{children}</div>
        },
        ModalTitle: function Mock({ children }) {
            return <div className="ui-ModalTitle">{children}</div>
        },
    }
})
/* eslint-enable react/prop-types */

describe('DownloadDialog', () => {
    test('does not render if showDialog is false', () => {
        const store = {
            map: {
                name: 'my map',
                mapViews: [],
            },
            download: {
                showDialog: false,
                showName: true,
                showLegend: true,
                legendPosition: 'bottomright',
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders enabled showName, disabled showLegend', () => {
        downloadSupport.mockReturnValue(true)
        const store = {
            map: {
                name: 'the map',
                mapViews: [],
            },
            download: {
                showDialog: true,
                showName: true,
                showLegend: true,
                legendPosition: 'bottomright',
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders with enabled showLegend', () => {
        downloadSupport.mockReturnValue(true)
        const store = {
            map: {
                name: 'the map',
                mapViews: [
                    {
                        legend: 'thelegend',
                    },
                ],
            },
            download: {
                showDialog: true,
                showName: true,
                showLegend: true,
                legendPosition: 'bottomright',
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('does not show download options if no browser support', () => {
        downloadSupport.mockReturnValue(false)
        const store = {
            map: {
                name: 'the map',
                mapViews: [],
            },
            download: {
                showDialog: true,
                showName: true,
                showLegend: true,
                legendPosition: 'bottomright',
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
