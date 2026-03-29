import { render } from '@testing-library/react'
import React from 'react'
import DownloadLegend from '../DownloadLegend.jsx'

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
        {
            id: 'layer-3',
        },
    ]

    it('Should render a legend component', () => {
        const { container } = render(<DownloadLegend layers={layers} />)
        expect(container).toMatchSnapshot()
    })
})
