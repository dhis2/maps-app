import { shallow } from 'enzyme'
import React from 'react'
import DownloadLegend from '../DownloadLegend.js'

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
            legend: {
                title: 'Layer 2',
                period: '2017',
            },
        },
    ]

    const renderComponent = (props) => shallow(<DownloadLegend {...props} />)

    it('Should render a legend component', () => {
        expect(renderComponent({ layers }).exists()).toBe(true)
    })

    it('Should only render layers with legends', () => {
        const wrapper = renderComponent({ layers })

        expect(wrapper.length).toEqual(2)
        expect(wrapper.find('Legend').length).toEqual(2)
    })

    it('Should render legend title and period', () => {
        const wrapper = renderComponent({ layers })
        expect(wrapper.containsMatchingElement('Layer 1')).toBe(true)
        expect(wrapper.containsMatchingElement(<span>2018</span>)).toBe(true)
    })
})
