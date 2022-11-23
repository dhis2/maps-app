import React from 'react'
import { shallow } from 'enzyme'
import OrgUnitData from '../OrgUnitData'
import PeriodSelect from '../../periods/PeriodSelect'

const defaultProps = {
    id: 'DiszpKrYNg8',
    periodType: 'YEARLY',
    defaultPeriod: {
        id: '2021',
    },
}

const data = [
    {
        id: 'WUg3MYWQ7pt',
        label: 'Total Population',
        value: 3503,
    },
    {
        id: 'DTVRnCGamkV',
        label: 'Total population < 1 year',
        value: 140,
    },
    {
        id: 'vg6pdjObxsm',
        label: 'Population of women of child bearing age (WRA)',
        value: 716,
    },
    {
        id: 'Uvn6LCg7dVU',
        label: 'ANC 1 Coverage',
        value: 368.2,
    },
    {
        id: 'eTDtyyaSA7f',
        label: 'FIC <1y',
        value: 291.4,
    },
]

describe('Org unit data items', () => {
    const renderWithProps = (props) =>
        shallow(<OrgUnitData {...defaultProps} {...props} />)

    it('should render a period select', () => {
        expect(renderWithProps().find('PeriodSelect')).toHaveLength(1)
    })

    it('should render a list of data items', () => {
        const wrapper = renderWithProps({ data })

        expect(wrapper.find('tr')).toHaveLength(data.length)

        wrapper.find('tr').forEach((node, index) => {
            expect(node.find('th').prop('children')).toEqual(data[index].label)
            expect(node.find('td').prop('children')).toEqual(data[index].value)
        })
    })
})
