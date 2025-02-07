import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import Timeline from '../Timeline.js'

const mockStore = configureMockStore()

describe('Timeline', () => {
    const store = mockStore({
        ui: { layersPanelOpen: false, rightPanelOpen: false },
    })
    const renderWithProps = (props) =>
        mount(
            <Provider store={store}>
                <Timeline {...props} />
            </Provider>
        )

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
    const periodOnChange = {
        id: '201904',
        name: 'April 2019',
        startDate: new Date('2019-04-01T00:00:00.000'),
        endDate: new Date('2019-04-30T24:00:00.000'),
        level: 7,
        levelRank: 0,
        type: 'MONTHLY',
    }
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
        const svg = wrapper.find('svg')
        expect(svg.exists()).toBe(true)
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
        expect(onChangeSpy).toHaveBeenCalledWith(periodOnChange)
    })

    it('Should toggle play mode when play/pause button is clicked', () => {
        const wrapper = renderWithProps(props)
        const playPauseBtn = wrapper.find('g').first()
        expect(wrapper.find('.play-icon').length).toBe(1)
        expect(wrapper.find('.pause-icon').length).toBe(0)
        playPauseBtn.simulate('click')
        expect(wrapper.find('.play-icon').length).toBe(0)
        expect(wrapper.find('.pause-icon').length).toBe(1)
        expect(onChangeSpy).toHaveBeenCalledWith(periodOnChange)
        playPauseBtn.simulate('click')
        expect(wrapper.find('.play-icon').length).toBe(1)
        expect(wrapper.find('.pause-icon').length).toBe(0)
    })
})
