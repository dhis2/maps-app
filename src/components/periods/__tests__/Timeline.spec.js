import { shallow } from 'enzyme'
import React from 'react'
import Timeline from '../Timeline.js'

const context = {
    map: {
        on: jest.fn(),
        off: jest.fn(),
    },
}

describe('Timeline', () => {
    const renderWithProps = (props) =>
        shallow(<Timeline {...props} />, { context })

    const periodId = 'LAST_3_MONTHS'
    const period = { id: '201906', name: 'June 2019' }
    const periods = [
        {
            id: '201904',
            name: 'April 2019',
            startDate: new Date('2019-04-01T00:00:00.000'),
            endDate: new Date('2019-04-30T24:00:00.000'),
        },
        {
            id: '201905',
            name: 'May 2019',
            startDate: new Date('2019-05-01T00:00:00.000'),
            endDate: new Date('2019-05-31T24:00:00.000'),
        },
        {
            id: '201906',
            name: 'June 2019',
            startDate: new Date('2019-06-01T00:00:00.000'),
            endDate: new Date('2019-06-30T24:00:00.000'),
        },
    ]
    const onChangeSpy = jest.fn()
    let props

    beforeEach(() => {
        props = {
            periodId,
            period,
            periods,
            onChange: onChangeSpy,
            classes: {},
        }
    })

    it('should render svg', () => {
        const wrapper = renderWithProps(props)
        expect(wrapper.type()).toBe('svg')
    })

    it('should render one rect for each period', () => {
        const wrapper = renderWithProps(props)
        expect(wrapper.find('rect')).toHaveLength(periods.length)
    })

    it('should highlight the current period', () => {
        const wrapper = renderWithProps(props)
        const periodIndex = periods.findIndex((p) => p.id === period.id)
        expect(wrapper.find('rect').at(periodIndex).hasClass('selected')).toBe(
            true
        )
    })

    it('should call onChange with the period clicked', () => {
        const wrapper = renderWithProps(props)
        wrapper.find('rect').first().simulate('click')
        // Update periods[0] to account for the updated sorting logic
        expect(onChangeSpy).toHaveBeenCalledWith(periods[0])
    })

    it('Should toggle play mode when play/pause button is clicked', () => {
        const wrapper = renderWithProps(props)
        const playPauseBtn = wrapper.find('g').first()

        expect(wrapper.state('mode')).toBe('start')
        playPauseBtn.simulate('click')
        expect(wrapper.state('mode')).toBe('play')
        // Called because current period is the last
        expect(onChangeSpy).toHaveBeenCalledWith(periods[0])
        playPauseBtn.simulate('click')
        expect(wrapper.state('mode')).toBe('stop')
    })
})
