import { shallow } from 'enzyme'
import React from 'react'
import { EventDownloadInputs } from '../EventDownloadInputs.js'

describe('EventDownloadInputs', () => {
    const formatOptions = [
        { id: 1, name: 'Test Format' },
        { id: 2, name: 'No Format' },
        { id: 3, name: 'Some Format' },
    ]
    const renderComponent = (props) =>
        shallow(
            <EventDownloadInputs
                classes={{}}
                formatOptions={formatOptions}
                selectedFormatOption={0}
                humanReadableChecked={false}
                onChangeFormatOption={() => null}
                onCheckHumanReadable={() => null}
                {...props}
            />
        )

    it('Should render select box and checkbox when an Event layer', () => {
        const wrapper = renderComponent()
        expect(wrapper.children().length).toBe(3)
        expect(wrapper.find('SelectField').length).toBe(1)
        expect(wrapper.find('SelectField').prop('value')).toBe(0)

        expect(wrapper.find('Checkbox').length).toBe(1)
        expect(wrapper.find('Checkbox').prop('checked')).toBe(false)
    })

    it('Should respect controlled inputs', () => {
        const wrapper = renderComponent({
            selectedFormatOption: 2,
            humanReadableChecked: true,
        })
        expect(wrapper.find('SelectField').prop('value')).toBe(2)

        expect(wrapper.find('Checkbox').length).toBe(1)
        expect(wrapper.find('Checkbox').prop('checked')).toBe(true)
    })

    // it('Should toggle checked in onCheckHumanReadable callback when clicking the checkbox', () => {
    //     const fn = jest.fn();
    //     const wrapper = renderComponent({
    //         onCheckHumanReadable: fn,
    //     });
    //     const checkbox = wrapper.find('Checkbox');
    //     checkbox.simulate('change', { target: { checked: true } });
    //     expect(fn).toHaveBeenCalledWith(true);
    //     checkbox.simulate('change', { target: { checked: false } });
    //     expect(fn).toHaveBeenCalledWith(false);
    // });

    // it('Should toggle checked in onCheckHumanReadable callback when clicking the checkbox', () => {
    //     const fn = jest.fn();
    //     const wrapper = renderComponent({
    //         onChangeFormatOption: fn,
    //     });
    //     wrapper.find('SelectField [role="button"]').simulate('click');
    //     const selectOptions = wrapper.find('MenuItem');
    //     expect(selectOptions.length).toBe(3);
    //     selectOptions.at(2).simulate('click');
    //     expect(fn).toHaveBeenCalledWith(formatOptions[2]);
    // });
})
