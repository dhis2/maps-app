import { shallow } from 'enzyme'
import React from 'react'
import { DataDownloadDialogContent } from '../DataDownloadDialogContent.js'

describe('DataDownloadDialogContent', () => {
    const formatOptions = [
        { id: 1, name: 'Test Format' },
        { id: 2, name: 'No Format' },
        { id: 3, name: 'Some Format' },
    ]
    const renderOuterComponent = (props) =>
        shallow(
            <DataDownloadDialogContent
                isEventLayer={false}
                error={null}
                layerName={'Test Layer.js'}
                formatOptions={formatOptions}
                humanReadableChecked={false}
                onChangeFormatOption={() => null}
                onCheckHumanReadable={() => null}
                {...props}
            />
        )

    it('Should render only one div when not an event layer', () => {
        const wrapper = renderOuterComponent()

        expect(wrapper.children().length).toBe(2)
        expect(wrapper.find('div').length).toBe(1)
    })

    it('Should render an error message', () => {
        const wrapper = renderOuterComponent({
            error: 'This is an error!',
        })

        expect(wrapper.find('div').length).toBe(1)
        expect(wrapper.html().indexOf('Data download failed.')).not.toBe(-1)
    })

    it('Should render inputs when isEventLayer.js', () => {
        const wrapper = renderOuterComponent({ isEventLayer: true })
        expect(wrapper.children().length).toBe(3)
        expect(wrapper.find('EventDownloadInputs').length).toBe(1)
    })

    it('Should render error below format inputs', () => {
        const wrapper = renderOuterComponent({
            isEventLayer: true,
            error: 'This is an error!',
        })
        expect(wrapper.children().length).toBe(4)
        expect(wrapper.html().indexOf('Data download failed.')).not.toBe(-1)
    })
})
