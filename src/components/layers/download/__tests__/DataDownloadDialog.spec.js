import React from 'react'
import { shallow } from 'enzyme'
import { DataDownloadDialog } from '../DataDownloadDialog'

// Requested by util/geojson dep
jest.mock('../../../map/MapApi.js', () => ({
    poleOfInaccessibility: jest.fn(),
}))

describe('DataDownloadDialogContent', () => {
    const formatOptions = [
        { id: 1, name: 'Test Format' },
        { id: 2, name: 'No Format' },
        { id: 3, name: 'Some Format' },
    ]
    const renderComponent = (props) =>
        shallow(
            <DataDownloadDialog
                open={false}
                downloading={false}
                error={null}
                layer={null}
                startDownload={() => null}
                closeDialog={() => null}
                {...props}
            />
        )

    const dummyEventLayer = { layer: 'event', name: 'Event layer' }
    const dummyThematicLayer = { layer: 'thematic', name: 'Thematic layer' }

    it('Should render null when not open', () => {
        const wrapper = renderComponent()
        expect(wrapper.isEmptyRender()).toBe(true)
    })

    it('Should render null when open but layer is null', () => {
        const wrapper = renderComponent({
            open: true,
        })
        expect(wrapper.isEmptyRender()).toBe(true)
    })

    it('Should render a dialog when open', () => {
        const wrapper = renderComponent({
            open: true,
            layer: dummyEventLayer,
        })

        expect(wrapper.isEmptyRender()).toBe(false)
        expect(wrapper.find('Modal').length).toBe(1)
        expect(wrapper.find('DataDownloadDialogContent').length).toBe(1)
        expect(wrapper.find('DataDownloadDialogActions').length).toBe(1)
        expect(
            wrapper.find('DataDownloadDialogActions').prop('downloading')
        ).toBe(false)
        expect(
            wrapper.find('DataDownloadDialogContent').prop('isEventLayer.js')
        ).toBe(true)
    })

    it('Should detect isEventLayer correctly', () => {
        const wrapper = renderComponent({
            open: true,
            layer: dummyThematicLayer,
        })
        expect(wrapper.isEmptyRender()).toBe(false)
        expect(
            wrapper.find('DataDownloadDialogContent').prop('isEventLayer.js')
        ).toBe(false)
    })
    it('Should default state to selectedFormatOption=2 and humanReadableChecked=true', () => {
        const wrapper = renderComponent({
            open: true,
            layer: dummyEventLayer,
        })
        expect(wrapper.isEmptyRender()).toBe(false)
        expect(wrapper.state().selectedFormatOption).toBe(2)
        expect(
            wrapper
                .find('DataDownloadDialogContent')
                .prop('selectedFormatOption')
        ).toBe(3) // 1-indexed
        expect(wrapper.state().humanReadableChecked).toBe(true)
        expect(
            wrapper
                .find('DataDownloadDialogContent')
                .prop('humanReadableChecked')
        ).toBe(true)
    })
    it('Should update humanReadableChecked when calling onCheckHumanReadable', () => {
        const wrapper = renderComponent({
            open: true,
            layer: dummyEventLayer,
        })
        expect(wrapper.isEmptyRender()).toBe(false)
        expect(wrapper.state().humanReadableChecked).toBe(true)
        wrapper.instance().onCheckHumanReadable(false)
        expect(wrapper.state().humanReadableChecked).toBe(false)
    })
    it('Should update selectedFormatOption when calling onChangeFormatOption', () => {
        const wrapper = renderComponent({
            open: true,
            layer: dummyEventLayer,
        })
        expect(wrapper.isEmptyRender()).toBe(false)
        expect(wrapper.state().selectedFormatOption).toBe(2)
        wrapper.instance().onChangeFormatOption({ id: 1 }) // IDs are 1-indexed, selectedFormatOption is 0-indexed
        expect(wrapper.state().selectedFormatOption).toBe(0) // 1 - 1 = 0
    })
    it('Should pass downloading to Actions', () => {
        const wrapper = renderComponent({
            open: true,
            layer: dummyEventLayer,
            downloading: true,
        })
        expect(
            wrapper.find('DataDownloadDialogActions').prop('downloading')
        ).toBe(true)
    })
})
