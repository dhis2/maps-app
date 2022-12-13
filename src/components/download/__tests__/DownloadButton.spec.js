import { shallow } from 'enzyme'
import React from 'react'
import { DownloadButton } from '../DownloadButton.js'

describe('DownloadButton', () => {
    const renderComponent = (props) =>
        shallow(
            <DownloadButton
                classes={{}}
                toggleDownloadDialog={() => null}
                {...props}
            />
        )

    it('Should render a download button', () => {
        const wrapper = renderComponent()
        expect(wrapper.find('MenuButton').exists()).toBe(true)
        expect(wrapper.find('MenuButton').render().text()).toEqual('Download')
    })

    it('Should render a download dialog', () => {
        const wrapper = renderComponent()
        expect(wrapper.find('Connect(DownloadDialog)').exists()).toBe(true)
    })

    it('Should render a download button and a dialog component', () => {
        const wrapper = renderComponent()
        expect(wrapper).toMatchSnapshot()
    })

    it('should call toggleDownloadDialog when download button is clicked', () => {
        const toggleDownloadDialogSpy = jest.fn()
        const wrapper = renderComponent({
            toggleDownloadDialog: toggleDownloadDialogSpy,
        })

        wrapper.find('MenuButton').simulate('click', true)
        expect(toggleDownloadDialogSpy).toHaveBeenCalled()
    })
})
