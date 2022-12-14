import { shallow } from 'enzyme'
import React from 'react'
import { SelectField } from '../../core/index.js'
import { IndicatorGroupSelect } from '../IndicatorGroupSelect.js'

// TODO:
// clear the spied function after each test run: https://stackoverflow.com/questions/43245040/using-jest-to-spy-on-method-call-in-componentdidmount

describe('IndicatorGroupSelect', () => {
    const renderWithProps = (props) =>
        shallow(<IndicatorGroupSelect {...props} />)

    it('should render a d2-ui SelectField', () => {
        const loadIndicatorGroups = jest.fn()
        const onChange = jest.fn()
        expect(renderWithProps({ loadIndicatorGroups, onChange }).type()).toBe(
            SelectField
        )
    })

    it('should call loadIndicatorGroups function in componentDidMount if no indicator groups exists', () => {
        const loadIndicatorGroups = jest.fn()
        const onChange = jest.fn()
        const select = renderWithProps({ loadIndicatorGroups, onChange })

        select.instance().componentDidMount()
        expect(loadIndicatorGroups).toHaveBeenCalled()
    })

    it('should not call loadIndicatorGroups function in componentDidMount if indicator groups exists', () => {
        const loadIndicatorGroups = jest.fn()
        const onChange = jest.fn()
        const select = renderWithProps({
            loadIndicatorGroups,
            onChange,
            indicatorGroups: [],
        })

        select.instance().componentDidMount()
        expect(loadIndicatorGroups).not.toHaveBeenCalled()
    })
})
