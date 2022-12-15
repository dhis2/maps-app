import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import DataDownloadDialog from '../DataDownloadDialog.js'

// Requested by util/geojson dep
jest.mock('../../../map/MapApi.js', () => ({
    poleOfInaccessibility: jest.fn(),
}))

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

const mockStore = configureMockStore()

const dummyEventLayer = {
    id: 'eventlayerId',
    layer: 'event',
    name: 'Event layer',
}
const dummyThematicLayer = {
    id: 'thematicLayerId',
    layer: 'thematic',
    name: 'Thematic layer',
}

describe('DataDownloadDialogContent', () => {
    test('does not render when not open', () => {
        const store = {
            dataDownload: { dialogOpen: false, downloading: false },
            map: {
                mapViews: [],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DataDownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders null when open but layer is null', () => {
        const store = {
            dataDownload: { dialogOpen: true, downloading: false },
            map: {
                mapViews: [],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DataDownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('Should render a dialog when open', () => {
        const store = {
            dataDownload: {
                layerid: dummyThematicLayer.id,
                dialogOpen: true,
                downloading: false,
            },
            map: {
                mapViews: [dummyThematicLayer],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DataDownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders for an event layer', () => {
        const store = {
            dataDownload: {
                layerid: dummyEventLayer.id,
                dialogOpen: true,
                downloading: false,
            },
            map: {
                mapViews: [dummyEventLayer],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DataDownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders for event layer with downloading = true', () => {
        const store = {
            dataDownload: {
                layerid: dummyEventLayer.id,
                dialogOpen: true,
                downloading: true,
            },
            map: {
                mapViews: [dummyEventLayer],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DataDownloadDialog />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
