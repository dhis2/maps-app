import React from 'react';
import { shallow } from 'enzyme';
import { LayerToolbarMoreMenu } from '../LayerToolbarMoreMenu';

describe('LayerToolbarMoreMenu', () => {
    it('Should render nothing when no props passed', () => {
        const wrapper = shallow(<LayerToolbarMoreMenu classes={{}} />);
        expect(wrapper.equals(null)).toBe(true);
    });

    it('Should open menu on click', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu classes={{}} onRemove={() => null} />
        );

        expect(wrapper.state('open')).toBe(false);
        expect(wrapper.state('anchorEl')).toBe(null);
        wrapper.find('WithStyles(IconButton)').simulate('click', { currentTarget: 42 });
        expect(wrapper.state('open')).toBe(true);
        expect(wrapper.state('anchorEl')).toBe(42);
    });

    it('Should render a single MenuItem with no divider if the only prop is onRemove', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu classes={{}} onRemove={() => null} />
        );

        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1);

        expect(wrapper.find('WithStyles(MenuItem)').length).toBe(1);
        expect(wrapper.find('WithStyles(Divider)').length).toBe(0);
    });

    it('Should render two MenuItems with no divider if only passed onEdit and onRemove', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu classes={{}} onEdit={() => null} onRemove={() => null} />
        );

        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1);

        expect(wrapper.find('WithStyles(MenuItem)').length).toBe(2);
        expect(wrapper.find('WithStyles(Divider)').length).toBe(0);
    });

    it('Should render two MenuItems with no divider if only passed toggleDataTable', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu classes={{}} toggleDataTable={() => null} />
        );

        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1);

        expect(wrapper.find('WithStyles(MenuItem)').length).toBe(1);
        expect(wrapper.find('WithStyles(Divider)').length).toBe(0);
    });

    it('Should render two MenuItems with no divider if only passed toggleDataTable and downloadData', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu classes={{}} toggleDataTable={() => null} downloadData={() => null} />
        );

        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1);

        expect(wrapper.find('WithStyles(MenuItem)').length).toBe(2);
        expect(wrapper.find('WithStyles(Divider)').length).toBe(0);
    });

    it('Should render three MenuItems WITH divider if passed toggleDataTable, onEdit, and onRemove', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu classes={{}} onEdit={() => null} onRemove={() => null} toggleDataTable={() => null} />
        );

        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1);

        expect(wrapper.find('WithStyles(MenuItem)').length).toBe(3);
        expect(wrapper.find('WithStyles(Divider)').length).toBe(1);
    });

    it('Should render four MenuItems WITH divider if passed toggleDataTable, downloadData, onEdit, and onRemove', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu
                classes={{}}
                onEdit={() => null}
                onRemove={() => null}
                downloadData={() => null}
                toggleDataTable={() => null}
            />
        );

        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1);

        expect(wrapper.find('WithStyles(MenuItem)').length).toBe(4);
        expect(wrapper.find('WithStyles(Divider)').length).toBe(1);
    });

    it('Should match snapshot', () => {
        const wrapper = shallow(
            <LayerToolbarMoreMenu
                classes={{}}
                onEdit={() => null}
                onRemove={() => null}
                downloadData={() => null}
                toggleDataTable={() => null}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('Should respond to click events properly for MenuItems - toggleDataTable, downloadData, onEdit, and onRemove', () => {
        const onEdit = jest.fn(),
            onRemove = jest.fn(),
            toggleDataTable = jest.fn(),
            downloadData = jest.fn();

        const wrapper = shallow(
            <LayerToolbarMoreMenu
                classes={{}}
                onEdit={onEdit}
                onRemove={onRemove}
                downloadData={downloadData}
                toggleDataTable={toggleDataTable}
            />
        );

        wrapper
            .find('WithStyles(MenuItem)')
            .at(0)
            .simulate('click');
        expect(toggleDataTable).toHaveBeenCalledTimes(1);
        expect(downloadData).toHaveBeenCalledTimes(0);
        expect(onEdit).toHaveBeenCalledTimes(0);
        expect(onRemove).toHaveBeenCalledTimes(0);

        wrapper
            .find('WithStyles(MenuItem)')
            .at(1)
            .simulate('click');
        expect(toggleDataTable).toHaveBeenCalledTimes(1);
        expect(downloadData).toHaveBeenCalledTimes(1);
        expect(onEdit).toHaveBeenCalledTimes(0);
        expect(onRemove).toHaveBeenCalledTimes(0);

        wrapper
            .find('WithStyles(MenuItem)')
            .at(2)
            .simulate('click');
        expect(toggleDataTable).toHaveBeenCalledTimes(1);
        expect(downloadData).toHaveBeenCalledTimes(1);
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(onRemove).toHaveBeenCalledTimes(0);

        wrapper
            .find('WithStyles(MenuItem)')
            .at(3)
            .simulate('click');
        expect(toggleDataTable).toHaveBeenCalledTimes(1);
        expect(downloadData).toHaveBeenCalledTimes(1);
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(onRemove).toHaveBeenCalledTimes(1);
    });
});