import React from 'react';
import { shallow } from 'enzyme';
import { DataDownloadDialogContent } from '../DataDownloadDialogContent';

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
        expect(wrapper.find('WithStyles(EventDownloadInputs)').length).toBe(1);
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
});
