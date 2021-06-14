import React from 'react';
import { render } from '@testing-library/react';
import EventStatusSelect from '../EventStatusSelect';

test('EventStatusSelect displays a Select element', () => {
    const { container } = render(
        <EventStatusSelect onChange={jest.fn()} className="testClass" />
    );
    expect(container).toMatchSnapshot();
});
