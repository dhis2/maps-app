import React from 'react';
import { shallow } from 'enzyme';
import { DownloadButton } from '../DownloadButton';

describe('DownloadButton', () => {
    const renderComponent = props =>
        shallow(
            <DownloadButton
                classes={{}}
                toggleDownloadDialog={() => null}
                {...props}
            />
        );

    it('Should render a download button', () => {
        const wrapper = renderComponent();
        expect(wrapper.find('WithStyles(Button)').exists()).toBe(true);
        expect(
            wrapper
                .find('WithStyles(Button)')
                .render()
                .text()
        ).toEqual('Download');
    });

    it('Should render a download dialog', () => {
        const wrapper = renderComponent();
        expect(
            wrapper.find('Connect(WithStyles(DownloadDialog))').exists()
        ).toBe(true);
    });

    it('Should render a download button and a dialog component', () => {
        const wrapper = renderComponent();
        expect(wrapper).toMatchSnapshot();
    });

    it('should call toggleDownloadDialog when download button is clicked', () => {
        const toggleDownloadDialogSpy = jest.fn();
        const wrapper = renderComponent({
            toggleDownloadDialog: toggleDownloadDialogSpy,
        });

        wrapper.find('WithStyles(Button)').simulate('click', true);
        expect(toggleDownloadDialogSpy).toHaveBeenCalled();
    });
});
