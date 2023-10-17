import {
    SingleSelectField,
    SingleSelectOption,
    MultiSelectField,
    MultiSelectOption,
} from '@dhis2/ui'
import { shallow } from 'enzyme'
import React from 'react'
import SelectField from '../SelectField.js'

const items = [
    {
        id: 'cat',
        name: 'Cat',
    },
    {
        id: 'mouse',
        name: 'Mouse',
    },
    {
        id: 'dog',
        name: 'Dog',
    },
]

describe('SelectField', () => {
    const renderWithProps = (props) => shallow(<SelectField {...props} />)

    it('should be a SingleSelectField by default', () => {
        const wrapper = renderWithProps()
        expect(wrapper.find(SingleSelectField)).toHaveLength(1)
    })

    it('should be a MultipleSelectField if multiple is true', () => {
        const wrapper = renderWithProps({ multiple: true })
        expect(wrapper.find(MultiSelectField)).toHaveLength(1)
    })

    it('should pass label to SingleSelectField', () => {
        const wrapper = renderWithProps({ label: 'My label' })
        expect(wrapper.find(SingleSelectField).props().label).toBe('My label')
    })

    it('should pass value to SingleSelectField as selected prop', () => {
        const wrapper = renderWithProps({ value: 'cat' })
        expect(wrapper.find(SingleSelectField).props().selected).toBe('cat')
    })

    it('should pass className to select field wrapper', () => {
        const wrapper = renderWithProps({ className: 'myClass' })
        expect(wrapper.props().className).toContain('myClass')
    })

    it('should render items array as SingleSelectOption', () => {
        const wrapper = renderWithProps({ items })
        expect(wrapper.find(SingleSelectOption)).toHaveLength(items.length)
    })

    it('should render items array as MultiSelectOption if multiple select', () => {
        const wrapper = renderWithProps({
            multiple: true,
            items,
        })
        expect(wrapper.find(MultiSelectOption)).toHaveLength(items.length)
    })

    it('should call onChange with item object when single select', () => {
        const onChangeSpy = jest.fn()
        renderWithProps({ items, onChange: onChangeSpy })
            .find(SingleSelectField)
            .props()
            .onChange({ selected: 'mouse' })

        expect(onChangeSpy).toHaveBeenCalledWith(items[1])
    })

    it('should call onChange with array of id when multiple select', () => {
        const onChangeSpy = jest.fn()
        renderWithProps({
            multiple: true,
            items,
            onChange: onChangeSpy,
        })
            .find(MultiSelectField)
            .props()
            .onChange({ selected: ['cat'] })

        expect(onChangeSpy).toHaveBeenCalledWith(['cat'])
    })

    it('should call onChange with array of ids when multiple select', () => {
        const onChangeSpy = jest.fn()
        renderWithProps({
            multiple: true,
            items,
            onChange: onChangeSpy,
        })
            .find(MultiSelectField)
            .props()
            .onChange({ selected: ['cat', 'mouse'] })

        expect(onChangeSpy).toHaveBeenCalledWith(['cat', 'mouse'])
    })

    it('should pass loading prop to SingleSelectField', () => {
        const wrapper = renderWithProps({ loading: true })
        expect(wrapper.find(SingleSelectField).props().loading).toBe(true)
    })

    it('should pass errorText as error with validationText to SingleSelectField', () => {
        const wrapper = renderWithProps({ errorText: 'Error message' })
        expect(wrapper.find(SingleSelectField).props().error).toBe(true)
        expect(wrapper.find(SingleSelectField).props().validationText).toBe(
            'Error message'
        )
    })
})
