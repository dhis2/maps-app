import React from 'react';
import { shallow } from 'enzyme';
import ListItem from '../ListItem';

describe('Drawer', () => {
    it('should not render if children is missing', () => {
        const wrapper = shallow(<ListItem label="My label" />);

        expect(wrapper.type()).toBe(null);
    });

    it('should render if a value is passed as children', () => {
        const wrapper = shallow(<ListItem label="My label">123</ListItem>);

        expect(wrapper.type()).toEqual('table');
        expect(wrapper.find('td').prop('children')).toEqual('123');
    });

    it('should display a label', () => {
        const wrapper = shallow(<ListItem label="My label">123</ListItem>);

        expect(wrapper.find('th').prop('children')).toEqual('My label');
    });

    it('should change value if formatter is passed', () => {
        const formatter = jest.fn(value => ++value);
        const wrapper = shallow(
            <ListItem label="My label" formatter={formatter}>
                123
            </ListItem>
        );

        expect(formatter).toHaveBeenCalledWith('123');
        expect(wrapper.find('td').prop('children')).toEqual(124);
    });
});
