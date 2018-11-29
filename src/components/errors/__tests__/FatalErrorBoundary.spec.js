import React from 'react';
import FatalErrorBoundary from '../FatalErrorBoundary';
import { mount } from 'enzyme';

const Something = () => {
    // Placeholder
    return null;
};

describe('FatalErrorBoundary', () => {
    it('Should render the normal tree when no error occurs', () => {
        const wrapper = mount(
            <FatalErrorBoundary>
                <div>
                    <span id="testme">Hello there!</span>
                </div>
            </FatalErrorBoundary>
        );

        expect(wrapper.find('span#testme').length).toBe(1);
    });

    it('Should render the error mask when an error is thrown', () => {
        const wrapper = mount(
            <FatalErrorBoundary>
                <Something />
            </FatalErrorBoundary>
        );

        expect(wrapper.find(Something).length).toBe(1);

        const testErrorText =
            'This is a test of the emergency alert system.  This is only a test.';
        wrapper.find(Something).simulateError(new Error(testErrorText));
        expect(wrapper.contains('Something went wrong')).toBe(true);
        expect(wrapper).toMatchSnapshot(); // NOTE: This snapshot will change if the .simulateError location changes in this file, since the snapshot includes the callstack!
    });
});
