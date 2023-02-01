import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import DownloadButton from '../DownloadButton.js'

jest.mock('../../../actions/download', () => {
    return {
        toggleDownloadMode: jest
            .fn()
            .mockReturnValue({ type: 'DOWNLOAD_MODE_TOGGLE' }),
    }
})

/* eslint-disable react/prop-types */
jest.mock('../DownloadDialog.js', () => {
    return {
        __esModule: true,
        default: function Mock(props) {
            return <div className="ui-DownloadDialog">{props.children}</div>
        },
    }
})

jest.mock('../../core/index.js', () => {
    return {
        MenuButton: function Mock(props) {
            return <button className="ui-MenuButton">{props.children}</button>
        },
    }
})
/* eslint-enable react/prop-types */

const mockStore = configureMockStore()

describe('DownloadButton', () => {
    it('renders menu button and download dialog', () => {
        const store = {}

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DownloadButton />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
