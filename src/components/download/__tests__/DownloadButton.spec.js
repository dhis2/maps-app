import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import DownloadButton from '../DownloadButton.js'

jest.mock('../../../actions/download', () => {
    return {
        setDownloadMode: jest
            .fn()
            .mockReturnValue({ type: 'DOWNLOAD_MODE_SET' }),
    }
})

/* eslint-disable react/prop-types */
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
    it('renders a download button', () => {
        const store = {}

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DownloadButton />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
