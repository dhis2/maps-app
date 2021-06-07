import React from 'react';
import { render } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import EventDialog from '../EventDialog';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

test('EventDialog displays the dialog with the Data tab open', () => {
    const props = {
        defaultPeriod: 'LAST_12_MONTHS',
        eventClustering: true,
        layer: 'event',
        type: 'Events',
        validateLayer: false,
    };

    const store = {
        orgUnitTree: [],
    };

    const { container } = render(
        <Provider store={mockStore(store)}>
            <EventDialog {...props} onLayerValidation={jest.fn()} />
        </Provider>
    );
    expect(container).toMatchSnapshot();
});
