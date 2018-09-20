import React from 'react';
import { shallow } from 'enzyme';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SelectField } from '../SelectField';
import Checkbox from '@material-ui/core/Checkbox';

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
];

describe('SelectField', () => {
    const renderWithProps = props =>
        shallow(<SelectField classes={{}} {...props} />);

    it('should be a TextField', () => {
        const wrapper = renderWithProps();
        expect(wrapper.type()).toBe(TextField);
    });

    it('should pass label to TextField', () => {
        const wrapper = renderWithProps({ label: 'My label' });
        expect(wrapper.props().label).toBe('My label');
    });

    it('should pass value to TextField', () => {
        const wrapper = renderWithProps({ value: 'cat' });
        expect(wrapper.props().value).toBe('cat');
    });

    it('should pass style to TextField', () => {
        const wrapper = renderWithProps({ style: { background: 'red' } });
        expect(wrapper.props().style).toEqual({ background: 'red' });
    });

    it('should render items array as menu items', () => {
        const wrapper = renderWithProps({ items });
        expect(wrapper.find(MenuItem)).toHaveLength(items.length);
    });

    it('should render checkboxes for menu items if multiple select', () => {
        const wrapper = renderWithProps({
            multiple: true,
            items,
        });
        expect(wrapper.find(Checkbox)).toHaveLength(items.length);
    });

    it('should check item if value is passed to multiple select', () => {
        const wrapper = renderWithProps({
            multiple: true,
            value: ['dog'],
            items,
        });
        expect(
            wrapper
                .find({ value: 'dog' })
                .find(Checkbox)
                .props().checked
        ).toBe(true);
    });

    it('should call onChange with item object when single select', () => {
        const onChangeSpy = jest.fn();
        renderWithProps({ items, onChange: onChangeSpy })
            .props()
            .onChange({ target: { value: 'mouse' } });
        expect(onChangeSpy).toHaveBeenCalledWith(items[1]);
    });

    it('should call onChange with array of id when multiple select', () => {
        const onChangeSpy = jest.fn();
        renderWithProps({
            multiple: true,
            items,
            onChange: onChangeSpy,
        })
            .props()
            .onChange({ target: { value: ['cat'] } });

        expect(onChangeSpy).toHaveBeenCalledWith(['cat']);
    });

    it('should call onChange with array of ids when multiple select', () => {
        const onChangeSpy = jest.fn();
        renderWithProps({
            multiple: true,
            items,
            onChange: onChangeSpy,
        })
            .props()
            .onChange({ target: { value: ['cat', 'mouse'] } });

        expect(onChangeSpy).toHaveBeenCalledWith(['cat', 'mouse']);
    });

    it('should show spinner when loading is set to true', () => {
        const wrapper = renderWithProps({ loading: true });
        expect(wrapper.find(CircularProgress)).toHaveLength(1);
    });

    it('should pass errorText as error with helperText to TextField', () => {
        const wrapper = renderWithProps({ errorText: 'Error message' });
        expect(wrapper.props().error).toBe(true);
        expect(wrapper.props().helperText).toBe('Error message');
    });
});
