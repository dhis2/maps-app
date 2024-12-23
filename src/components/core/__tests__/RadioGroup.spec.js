import { FieldGroup } from '@dhis2/ui'
import { mount } from 'enzyme'
import React from 'react'
import RadioGroup, { RadioContext } from '../RadioGroup.js'

describe('RadioGroup', () => {
    const mockOnChange = jest.fn()

    const renderWithProps = (props) => mount(<RadioGroup {...props} />)

    const value = 'option1'
    const label = 'Select an option'
    const helpText = 'Choose one of the available options'
    const children = [
        <input key="key1" type="radio" value="option1" />,
        <input key="key2" type="radio" value="option2" />,
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
        const labelElement = wrapper.children().find('div').first()
        expect(labelElement.text()).toBe(label)
        expect(labelElement.hasClass('boldLabel')).toBe(true)
    })

    it('renders the help text', () => {
        const wrapper = renderWithProps(props)
        expect(wrapper.find(FieldGroup).prop('helpText')).toBe(helpText)
    })

    it('provides the current value and onChange via context', () => {
        const wrapper = renderWithProps(props)
        const context = wrapper.find(RadioContext.Provider).prop('value')
        expect(context.radio).toBe(value)
        expect(context.onChange).toBe(mockOnChange)
    })

    it('renders children inside the FieldGroup', () => {
        const wrapper = renderWithProps(props)
        expect(wrapper.find(FieldGroup).contains(children)).toBe(true)
    })

    it('updates the radio state when value prop changes', () => {
        const wrapper = renderWithProps(props)
        expect(wrapper.find(RadioContext.Provider).prop('value').radio).toBe(
            value
        )

        wrapper.setProps({ value: 'option2' })
        wrapper.update()
        expect(wrapper.find(RadioContext.Provider).prop('value').radio).toBe(
            'option2'
        )
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
