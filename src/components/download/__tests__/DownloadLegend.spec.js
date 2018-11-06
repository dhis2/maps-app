import React from 'react';
import { shallow } from 'enzyme';
import { DownloadLegend } from '../DownloadLegend';

describe('DownloadLegend', () => {
    const classes = {
        root: 'root-class',
        topleft: 'topleft-class',
        topright: 'topright-class',
        bottomleft: 'bottomleft-class',
        bottomright: 'bottomright-class',
        name: 'name-class',
    };

    const layers = [
        {
            id: 'layer-1',
            legend: {
                title: 'Layer 1',
                period: '2018',
            },
        },
        {
            id: 'layer-2',
        },
        {
            id: 'layer-3',
            legend: {
                title: 'Layer 2',
                period: '2017',
            },
        },
    ];

    const renderComponent = props =>
        shallow(
            <DownloadLegend
                classes={classes}
                position="bottomright"
                layers={[]}
                showName={false}
                {...props}
            />
        );

    it('Should render a legend component', () => {
        expect(renderComponent().exists()).toBe(true);
    });

    it('Should set legend position class', () => {
        const wrapper = renderComponent();
        expect(wrapper.hasClass('bottomright-class')).toBe(true);
        wrapper.setProps({ position: 'topleft' });
        expect(wrapper.hasClass('topleft-class')).toBe(true);
    });

    it('Should set extra style class if top position and showName is true', () => {
        const wrapper = renderComponent({
            position: 'bottomright',
            showName: false,
        });

        expect(wrapper.hasClass('name-class')).toBe(false);
        wrapper.setProps({ showName: true });
        expect(wrapper.hasClass('name-class')).toBe(false);
        wrapper.setProps({ position: 'topleft' });
        expect(wrapper.hasClass('name-class')).toBe(true);
        wrapper.setProps({ position: 'topright' });
        expect(wrapper.hasClass('name-class')).toBe(true);
    });

    it('Should only render layers with legends', () => {
        const wrapper = renderComponent({ layers });
        expect(wrapper.children().length).toEqual(2);
        expect(wrapper.find('WithStyles(Legend)').length).toEqual(2);
    });

    it('Should render legend title and period', () => {
        const wrapper = renderComponent({ layers });
        expect(wrapper.containsMatchingElement('Layer 1')).toBe(true);
        expect(wrapper.containsMatchingElement(<span>2018</span>)).toBe(true);
    });
});
