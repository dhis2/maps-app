import React from 'react';
// import { shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
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

// https://material-ui.com/guides/testing/
// https://github.com/mui-org/material-ui/issues/9266
describe('SelectField', () => {
    let shallow;

    beforeEach(() => {
        shallow = createShallow();
    });

    const renderWithProps = props =>
        shallow(<SelectField classes={{}} {...props} />);

    it('should render a MUI TextField', () => {
        expect(renderWithProps().type()).toBe(TextField);
    });

    it('should set floatingLabelText when label is passed', () => {
        expect(renderWithProps({ label: 'My label' }).props().label).toEqual(
            'My label'
        );
    });

    /*
    it('should render items array as menu items', () => {
        const component = renderWithProps({ items });

        console.log('#', component.debug());

        // const node = <MenuItem value="mouse" />;
        const node = <Checkbox />;
        expect(component.contains(node)).toBe(true);
    });
    */

    /*
    it('should inset items when multiple select', () => {
        const component = renderWithProps({ items, multiple: true });
        const node = <MenuItem value="cat" primaryText="Cat" insetChildren />;
        expect(component.contains(node)).toBe(true);
    });

    it('should check selected items when multiple select', () => {
        const component = renderWithProps({
            items,
            multiple: true,
            value: ['cat'],
        }); // multiple: true, value: ['cat']
        const node = (
            <MenuItem value="cat" primaryText="Cat" insetChildren checked />
        );
        expect(component.contains(node)).toBe(true);
    });

    it('should render child nodes inside select field', () => {
        const noop = () => {};
        const node = (
            <SelectField onChange={noop}>
                <MenuItem value="cat" primaryText="Cat" />
            </SelectField>
        );
        const component = shallow(node, { context: getStubContext() });
        expect(
            component.contains(<MenuItem value="cat" primaryText="Cat" />)
        ).toBe(true);
    });

    it('should call onChange function when field content is changed', () => {
        const onChangeSpy = jest.fn();
        renderWithProps({ items, onChange: onChangeSpy })
            .props()
            .onChange({}, 1);
        expect(onChangeSpy).toHaveBeenCalledWith(items[1]);
    });

    it('should call onChange with item value when child nodes are used', () => {
        const onChangeSpy = jest.fn();
        const node = (
            <SelectField onChange={onChangeSpy}>
                <MenuItem value="cat" primaryText="Cat" />
            </SelectField>
        );
        shallow(node, { context: getStubContext() })
            .props()
            .onChange({}, 0, 'cat');
        expect(onChangeSpy).toHaveBeenCalledWith('cat');
    });

    it('should show spinner when loading is set to true', () => {
        const component = renderWithProps({ loading: true });
        expect(component.contains(<CircularProgress size={30} />)).toBe(true);
    });

    it('should show text when loading is string', () => {
        const message = 'Loading...';
        const component = renderWithProps({ loading: message });
        expect(component.contains(<div>{message}</div>)).toBe(true);
    });

    it('should show error text', () => {
        expect(
            renderWithProps({ errorText: 'Error message' }).props().errorText
        ).toEqual('Error message');
    });
    */
});
