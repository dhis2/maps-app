import { shallow } from 'enzyme'
import React from 'react'
import DataDownloadDialogActions from '../DataDownloadDialogActions.js'

describe('DataDownloadDialogActions', () => {
    const renderComponent = (props) =>
        shallow(
            <DataDownloadDialogActions
                downloading={false}
                onStartClick={() => null}
                onCancelClick={() => null}
                {...props}
            />
        )

    it('Should render two buttons and NO loading spinner', () => {
        const wrapper = renderComponent()
        expect(wrapper.find('Button').length).toBe(2)
        expect(wrapper.find('CircularLoader').length).toBe(0)
    })

    it('Should disable buttons and show loading spinner when loading', () => {
        const wrapper = renderComponent({
            downloading: true,
        })
        expect(wrapper.find('Button').at(0).prop('disabled')).toBe(true)
        expect(wrapper.find('Button').at(1).prop('disabled')).toBe(true)
        expect(wrapper.find('CircularLoader').length).toBe(1)
    })

    it('Should call onStartClick', () => {
        const fn = jest.fn()
        const wrapper = renderComponent({
            onStartClick: fn,
        })

        wrapper.find('Button[primary=true]').simulate('click')
        expect(fn).toHaveBeenCalled()
    })

    it('Should call onCancel', () => {
        const fn = jest.fn()
        const wrapper = renderComponent({ onCancelClick: fn })

        wrapper.find('Button[secondary=true]').simulate('click')
        expect(fn).toHaveBeenCalled()
    })
})
