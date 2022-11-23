import React from 'react'
import { shallow } from 'enzyme'
import { DownloadLegend } from '../DownloadLegend'

describe('DownloadLegend', () => {
    const layers = [
        {
            id: 'layer-1',
            legend: {
                title: 'Layer 1',
                period: '2018',
            },
        },
        {
            id: 'layer-2',
        },
        {
            id: 'layer-3',
            legend: {
                title: 'Layer 2',
                period: '2017',
            },
        },
    ]

    const renderComponent = (props) =>
        shallow(
            <DownloadLegend
                position="bottomright"
                layers={[]}
                showName={false}
                {...props}
            />
        )

    it('Should render a legend component', () => {
        expect(renderComponent().exists()).toBe(true)
    })

    it('Should only render layers with legends', () => {
        const wrapper = renderComponent({ layers })
        expect(wrapper.children().length).toEqual(2)
        expect(wrapper.find('Legend').length).toEqual(2)
    })

    it('Should render legend title and period', () => {
        const wrapper = renderComponent({ layers })
        expect(wrapper.containsMatchingElement('Layer 1')).toBe(true)
        expect(wrapper.containsMatchingElement(<span>2018</span>)).toBe(true)
    })
})
