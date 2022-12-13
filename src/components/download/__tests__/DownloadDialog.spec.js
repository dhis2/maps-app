import { shallow } from 'enzyme'
import React from 'react'
import { downloadSupport } from '../../../util/export-image.js'
import { DownloadDialog } from '../DownloadDialog.js'

jest.mock('../../../util/export-image', () => ({
    downloadSupport: jest.fn(),
}))

describe('DownloadDialog', () => {
    const renderComponent = (props = {}, isSupported = true) => {
        downloadSupport.mockImplementation(() => isSupported)

        return shallow(
            <DownloadDialog
                classes={{}}
                showDialog={true}
                showName={false}
                showLegend={false}
                legendPosition="bottomright"
                hasName={false}
                hasLegend={false}
                toggleDownloadDialog={() => null}
                toggleDownloadShowName={() => null}
                toggleDownloadShowLegend={() => null}
                setDownloadLegendPosition={() => null}
                {...props}
            />
        )
    }

    it('Should render null when showDialog is false', () => {
        const wrapper = renderComponent({
            showDialog: false,
        })
        expect(wrapper.isEmptyRender()).toBe(true)
    })

    it('Should render a dialog when showDialog is true', () => {
        const wrapper = renderComponent()
        expect(wrapper.isEmptyRender()).toBe(false)
        expect(wrapper.find('Modal').exists()).toBe(true)
    })

    it('Should match snapshot when showDialog is true', () => {
        const wrapper = renderComponent()
        expect(wrapper).toMatchSnapshot()
    })

    it('should call toggleDownloadDialog with false on dialog close', () => {
        const toggleDownloadDialogSpy = jest.fn()
        const wrapper = renderComponent({
            hasName: true,
            toggleDownloadDialog: toggleDownloadDialogSpy,
        })

        wrapper.simulate('close')
        expect(toggleDownloadDialogSpy).toHaveBeenCalledWith(false)
    })

    it('Should not show download options if no browser support', () => {
        const wrapper = renderComponent(null, false)

        expect(
            wrapper.find('ModalContent').render().text().substring(0, 29)
        ).toEqual('Map download is not supported')

        expect(wrapper.find('Button').at(0).render().text()).toEqual('Close')
    })

    it('Should show download options if browser support', () => {
        const wrapper = renderComponent()

        expect(wrapper.find('Checkbox').length).toBe(2)
        expect(wrapper.find('Button').length).toBe(2)
        expect(wrapper.find('Button').at(0).render().text()).toEqual('Cancel')
    })

    it('Should enable name checkbox if name exist', () => {
        const wrapper = renderComponent()
        expect(wrapper.find('Checkbox').at(0).prop('disabled')).toBe(true)
        wrapper.setProps({ hasName: true })
        expect(wrapper.find('Checkbox').at(0).prop('disabled')).toBe(false)
    })

    it('Should check name checkbox if showName prop is true', () => {
        const wrapper = renderComponent({
            hasName: true,
        })

        expect(wrapper.find('Checkbox').at(0).prop('checked')).toBe(false)
        wrapper.setProps({ showName: true })
        expect(wrapper.find('Checkbox').at(0).prop('checked')).toBe(true)
    })

    it('should call toggleDownloadShowName when name checkbox is checked', () => {
        const toggleDownloadShowNameSpy = jest.fn()
        const wrapper = renderComponent({
            hasName: true,
            toggleDownloadShowName: toggleDownloadShowNameSpy,
        })
        const checkbox = wrapper.find('Checkbox').at(0)

        checkbox.simulate('change', true)
        expect(toggleDownloadShowNameSpy).toHaveBeenCalledWith(true)

        checkbox.simulate('change', false)
        expect(toggleDownloadShowNameSpy).toHaveBeenCalledWith(false)
    })

    it('Should enable legend checkbox if legend exist', () => {
        const wrapper = renderComponent()
        expect(wrapper.find('Checkbox').at(1).prop('disabled')).toBe(true)
        wrapper.setProps({ hasLegend: true })
        expect(wrapper.find('Checkbox').at(1).prop('disabled')).toBe(false)
    })

    it('Should check legend checkbox if showLegend prop is true', () => {
        const wrapper = renderComponent({
            hasLegend: true,
        })

        expect(wrapper.find('Checkbox').at(1).prop('checked')).toBe(false)
        wrapper.setProps({ showLegend: true })
        expect(wrapper.find('Checkbox').at(1).prop('checked')).toBe(true)
    })

    it('should call toggleDownloadShowLegend when name checkbox is checked', () => {
        const toggleDownloadShowLegendSpy = jest.fn()
        const wrapper = renderComponent({
            hasName: true,
            toggleDownloadShowLegend: toggleDownloadShowLegendSpy,
        })
        const checkbox = wrapper.find('Checkbox').at(1)

        checkbox.simulate('change', true)
        expect(toggleDownloadShowLegendSpy).toHaveBeenCalledWith(true)

        checkbox.simulate('change', false)
        expect(toggleDownloadShowLegendSpy).toHaveBeenCalledWith(false)
    })

    it('should show legend position if legend exist and is shown', () => {
        const wrapper = renderComponent({
            hasLegend: true,
            showLegend: false,
        })

        expect(wrapper.find('LegendPosition').exists()).toBe(false)
        wrapper.setProps({ showLegend: true })

        expect(wrapper.find('LegendPosition').exists()).toBe(true)
    })

    it('should call setDownloadLegendPosition when legend position is changed', () => {
        const setDownloadLegendPositionSpy = jest.fn()
        const wrapper = renderComponent({
            hasLegend: true,
            showLegend: true,
            setDownloadLegendPosition: setDownloadLegendPositionSpy,
        })

        wrapper.find('LegendPosition').simulate('change', 'bottomleft')
        expect(setDownloadLegendPositionSpy).toHaveBeenCalledWith('bottomleft')
    })

    it('Should show browser message if error state is set', () => {
        const wrapper = renderComponent()

        wrapper.setState({ error: {} })

        expect(
            wrapper.find('ModalContent').render().text().substring(0, 29)
        ).toEqual('Map download is not supported')
    })
})
