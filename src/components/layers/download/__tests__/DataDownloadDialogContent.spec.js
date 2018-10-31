import React from 'react';
import { mount } from 'enzyme';
import { DataDownloadDialogContent } from '../DataDownloadDialogContent';

describe('DataDownloadDialogContent', () => {
    const formatOptions = [
        { id: 1, name: 'Test Format' },
        { id: 2, name: 'No Format' },
        { id: 3, name: 'Some Format' },
    ];
    const renderComponent = props => (
        mount(
            <DataDownloadDialogContent
                classes={{}}
                isEventLayer={false}
                error={null}
                formatOptions={formatOptions}
                humanReadableChecked={false}
                onChangeFormatOption={()=>null}
                onCheckHumanReadable={() => null}
                {...props}
            />
        )
    )

    it('Should render only two divs when not an event layer', () => {
        const wrapper = renderComponent();
        expect(wrapper.children().length).toBe(2);
        expect(wrapper.find('div').length).toBe(2);
    });

    it('Should render an error message', () => {
        const wrapper = renderComponent({
            error: 'This is an error!'
        });
        expect(wrapper.find('div').length).toBe(3);
        expect(wrapper.find('div').at(2).find('svg').length).toBe(1);;
    });

    it('Should render select box and checkbox when an Event layer', () => {
        const wrapper = renderComponent({
            isEventLayer: true,
        });
        expect(wrapper.children().length).toBe(3);
        expect(wrapper.find('SelectField').length).toBe(1);
        expect(wrapper.find('SelectField').prop('value')).toBe(0);
        expect(wrapper.find('input[type="checkbox"]').length).toBe(1); // Why is this 2?
        expect(wrapper.find('input[type="checkbox"]').prop('checked')).toBe(false);
    });

    it('Should render select box and checkbox when an Event layer', () => {
        const wrapper = renderComponent({ isEventLayer: true });
        expect(wrapper.children().length).toBe(3);
        expect(wrapper.find('SelectField').length).toBe(1);
        expect(wrapper.find('SelectField').prop('value')).toBe(0);
        
        wrapper.find('SelectField [role="button"]').simulate('click');
        expect(wrapper.find('MenuItem').length).toBe(3);

        expect(wrapper.find('input[type="checkbox"]').length).toBe(1);
        expect(wrapper
                .find('input[type="checkbox"]')
                .prop('checked')).toBe(false);
    });

    it('Should respect controlled inputs', () => {
        const wrapper = renderComponent({ 
            isEventLayer: true,
            selectedFormatOption: 2,
            humanReadableChecked: true,
        });
        expect(wrapper.find('SelectField').prop('value')).toBe(2);

        expect(wrapper.find('input[type="checkbox"]').length).toBe(1);
        expect(wrapper
            .find('input[type="checkbox"]')
            .prop('checked')).toBe(true);
    });

    it('Should render error below format inputs', () => {
        const wrapper = renderComponent({
            isEventLayer: true,
            error: 'This is an error!',
        });
        expect(wrapper.children().length).toBe(4);
        expect(wrapper.children().at(3).find('svg').length).toBe(1);;
    });

    it('Should toggle checked in onCheckHumanReadable callback when clicking the checkbox', () => {
        const fn = jest.fn();
        const wrapper = renderComponent({
            isEventLayer: true,
            onCheckHumanReadable: fn,
        });
        const checkbox = wrapper
            .find('input[type="checkbox"]')
        checkbox.simulate('change', { target: { checked: true }});
        expect(fn).toHaveBeenCalledWith(true);
        checkbox.simulate('change', { target: { checked: false } });
        expect(fn).toHaveBeenCalledWith(false);
    });

    it('Should toggle checked in onCheckHumanReadable callback when clicking the checkbox', () => {
        const fn = jest.fn();
        const wrapper = renderComponent({
            isEventLayer: true,
            onChangeFormatOption: fn,
        });
        wrapper.find('SelectField [role="button"]').simulate('click');
        const selectOptions = wrapper
            .find('MenuItem');
        expect(selectOptions.length).toBe(3);
        selectOptions
            .at(2)
            .simulate('click');
        expect(fn).toHaveBeenCalledWith(formatOptions[2]);
    });
});