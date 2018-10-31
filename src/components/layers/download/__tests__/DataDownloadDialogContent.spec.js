import React from 'react';
import { shallow } from 'enzyme';
import {
    DataDownloadDialogContent,
    EventDownloadInputs,
} from '../DataDownloadDialogContent';

describe('DataDownloadDialogContent', () => {
    const formatOptions = [
        { id: 1, name: 'Test Format' },
        { id: 2, name: 'No Format' },
        { id: 3, name: 'Some Format' },
    ];
    const renderOuterComponent = props =>
        shallow(
            <DataDownloadDialogContent
                classes={{}}
                isEventLayer={false}
                error={null}
                formatOptions={formatOptions}
                humanReadableChecked={false}
                onChangeFormatOption={() => null}
                onCheckHumanReadable={() => null}
                {...props}
            />
        );
    const renderInnerComponent = props => shallow(
            <EventDownloadInputs
                classes={{}}
                formatOptions={formatOptions}
                selectedFormatOption={0}
                humanReadableChecked={false}
                onChangeFormatOption={() => null}
                onCheckHumanReadable={() => null}
                {...props}
            />
        );

    it('Should render only two divs when not an event layer', () => {
        const wrapper = renderOuterComponent();
        expect(wrapper.children().length).toBe(2);
        expect(wrapper.find('div').length).toBe(2);
    });

    it('Should render an error message', () => {
        const wrapper = renderOuterComponent({
            error: 'This is an error!',
        });
        expect(wrapper.find('div').length).toBe(3);
        expect(wrapper.html().indexOf('Data download failed.')).not.toBe(-1);
    });

    it('Should render inputs when isEventLayer', () => {
        const wrapper = renderOuterComponent({ isEventLayer: true });
        expect(wrapper.children().length).toBe(3);
        expect(wrapper.find('EventDownloadInputs').length).toBe(1);
    });

    it('Should render error below format inputs', () => {
        const wrapper = renderOuterComponent({
            isEventLayer: true,
            error: 'This is an error!',
        });
        expect(wrapper.children().length).toBe(4);
        expect(wrapper
                .html()
                .indexOf('Data download failed.')).not.toBe(-1);
    });

    it('Should render select box and checkbox when an Event layer', () => {
        const wrapper = renderInnerComponent();
        expect(wrapper.children().length).toBe(2);
        expect(wrapper.find('SelectField').length).toBe(1);
        expect(wrapper.find('SelectField').prop('value')).toBe(0);

        expect(wrapper.find('WithStyles(Checkbox)').length).toBe(1);
        expect(wrapper
                .find('WithStyles(Checkbox)')
                .prop('checked')).toBe(false);
    });

    it('Should respect controlled inputs', () => {
        const wrapper = renderInnerComponent({
            selectedFormatOption: 2,
            humanReadableChecked: true,
        });
        expect(wrapper.find('SelectField').prop('value')).toBe(2);

        expect(wrapper.find('WithStyles(Checkbox)').length).toBe(1);
        expect(wrapper
                .find('WithStyles(Checkbox)')
                .prop('checked')).toBe(true);
    });

    // it('Should toggle checked in onCheckHumanReadable callback when clicking the checkbox', () => {
    //     const fn = jest.fn();
    //     const wrapper = renderInnerComponent({
    //         onCheckHumanReadable: fn,
    //     });
    //     const checkbox = wrapper.find('WithStyles(Checkbox)');
    //     checkbox.simulate('change', { target: { checked: true } });
    //     expect(fn).toHaveBeenCalledWith(true);
    //     checkbox.simulate('change', { target: { checked: false } });
    //     expect(fn).toHaveBeenCalledWith(false);
    // });

    // it('Should toggle checked in onCheckHumanReadable callback when clicking the checkbox', () => {
    //     const fn = jest.fn();
    //     const wrapper = renderInnerComponent({
    //         onChangeFormatOption: fn,
    //     });
    //     wrapper.find('SelectField [role="button"]').simulate('click');
    //     const selectOptions = wrapper.find('MenuItem');
    //     expect(selectOptions.length).toBe(3);
    //     selectOptions.at(2).simulate('click');
    //     expect(fn).toHaveBeenCalledWith(formatOptions[2]);
    // });
});
