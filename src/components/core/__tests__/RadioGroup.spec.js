import { FieldGroup } from '@dhis2/ui'
import { mount } from 'enzyme'
import React from 'react'
import { Radio, RadioGroup } from '../index.js'

describe('RadioGroup', () => {
    const mockOnChange = jest.fn()

    const renderWithProps = (props) => mount(<RadioGroup {...props} />)

    const value = 'option1'
    const label = 'Select an option'
    const helpText = 'Choose one of the available options'
    const children = [
        <Radio value="option1" label="option1" key="option1" />,
        <Radio value="option2" label="option2" key="option2" />,
    ]
    let props

    beforeEach(() => {
        jest.clearAllMocks()
        props = {
            value,
            label,
            helpText,
            display: 'column',
            onChange: mockOnChange,
            boldLabel: true,
            compact: false,
            children,
            dataTest: 'radio-group',
        }
    })

    it('renders the label with the correct style', () => {
        const wrapper = renderWithProps(props)
        const labelElement = wrapper.find('div.boldLabel')
        expect(labelElement.text()).toBe(label)
    })

    it('renders the help text', () => {
        const wrapper = renderWithProps(props)
        expect(wrapper.find(FieldGroup).prop('helpText')).toBe(helpText)
    })

    it('renders children inside the FieldGroup', () => {
        const wrapper = renderWithProps(props)
        expect(wrapper.find(FieldGroup).contains(children)).toBe(true)
    })

    it('updates the radio state when value prop changes', () => {
        const wrapper = renderWithProps(props)
        expect(
            wrapper.find('input[type="radio"][value="option1"]').prop('checked')
        ).toBe(true)

        wrapper.setProps({ value: 'option2' })
        wrapper.update()

        expect(
            wrapper.find('input[type="radio"][value="option2"]').prop('checked')
        ).toBe(true)
    })

    it('applies the correct class based on display and compact props', () => {
        props.display = 'row'
        props.compact = true
        const wrapper = renderWithProps(props)
        const container = wrapper.find('div').first()

        expect(container.hasClass('row')).toBe(true)
        expect(container.hasClass('compact')).toBe(true)
    })
})
