import React from 'react';
import { shallow } from 'enzyme';
import { Timeline } from '../Timeline';

describe('Timeline', () => {
    const renderWithProps = props => shallow(<Timeline {...props} />);

    let props;

    beforeEach(() => {
        props = {
            period: {},
            periods: [],
            onChange: jest.fn(),
            classes: {},
        };
    });

    it('should render svg', () => {
        const wrapper = renderWithProps(props);

        console.log('############### wrapper', wrapper.debug());

        expect(wrapper.type()).toBe('svg');
    });

    /*
    it('should not render MUI Snackbar if no alert is passed', () => {
        const wrapper = renderWithProps(props);
        expect(wrapper.find(Timeline).length).toBe(0);
    });
    */

    /*
    it('renders MUI Snackbar if alerts are passed', () => {
        expect(renderWithProps({ ...props, alert }).find(Timeline).length).toBe(
            1
        );
    });
    */
});
