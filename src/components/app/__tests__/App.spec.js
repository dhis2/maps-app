import React from 'react';
import { shallow } from 'enzyme';
import { App } from '../App';
import MapProvider from '../../map/MapProvider';

describe('App', () => {
    it('renders a MapProvider', () => {
        expect(shallow(<App />).find(MapProvider).length).toBe(1);
    });
});
