import React from 'react';
import { shallow } from 'enzyme';
import { DataDownloadDialogActions } from '../DataDownloadDialogActions';

describe('DataDownloadDialogActions', () => {
    const renderComponent = props =>
        shallow(
            <DataDownloadDialogActions
                classes={{}}
                downloading={false}
                onStartClick={() => null}
                onCancelClick={() => null}
                {...props}
            />
        );

    it('Should render two buttons and NO loading spinner', () => {
        const wrapper = renderComponent();
        expect(wrapper.find('WithStyles(ForwardRef(Button))').length).toBe(2);
        expect(
            wrapper.find('WithStyles(ForwardRef(CircularProgress))').length
        ).toBe(0);
    });

    it('Should disable buttons and show loading spinner when loading', () => {
        const wrapper = renderComponent({
            downloading: true,
        });
        expect(
            wrapper
                .find('WithStyles(ForwardRef(Button))')
                .at(0)
                .prop('disabled')
        ).toBe(true);
        expect(
            wrapper
                .find('WithStyles(ForwardRef(Button))')
                .at(1)
                .prop('disabled')
        ).toBe(true);
        expect(
            wrapper.find('WithStyles(ForwardRef(CircularProgress))').length
        ).toBe(1);
    });

    it('Should call onStartClick', () => {
        const fn = jest.fn();
        const wrapper = renderComponent({
            onStartClick: fn,
        });

        wrapper
            .find('WithStyles(ForwardRef(Button))[variant="contained"]')
            .simulate('click');
        expect(fn).toHaveBeenCalled();
    });

    it('Should call onCancel', () => {
        const fn = jest.fn();
        const wrapper = renderComponent({ onCancelClick: fn });

        wrapper
            .find('WithStyles(ForwardRef(Button))[variant="text"]')
            .simulate('click');
        expect(fn).toHaveBeenCalled();
    });
});
