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

    it('should not render MUI Snackbar if no alert is passed', () => {
        expect(renderWithProps(props).find(Timeline).length).toBe(0);
    });

    /*
    it('renders MUI Snackbar if alerts are passed', () => {
        expect(renderWithProps({ ...props, alert }).find(Timeline).length).toBe(
            1
        );
    });
    */
});
