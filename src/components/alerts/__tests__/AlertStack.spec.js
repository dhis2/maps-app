import { useAlerts } from '@dhis2/app-service-alerts'
import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import MapsAlertStack from '../AlertStack.js'

const mockStore = configureMockStore()

jest.mock('@dhis2/app-service-alerts', () => ({
    useAlerts: jest.fn(() => []),
}))

/* eslint-disable react/prop-types */
jest.mock('@dhis2/ui', () => {
    const originalModule = jest.requireActual('@dhis2/ui')

    return {
        __esModule: true,
        ...originalModule,
        // eslint-disable-next-line no-unused-vars
        AlertBar: function Mock({ children, onHidden, ...rest }) {
            return (
                <div className="mockAlertBar" {...rest}>
                    {children}
                </div>
            )
        },
        AlertStack: function Mock({ children }) {
            return <div className="mockAlertStack">{children}</div>
        },
    }
})
/* eslint-enable react/prop-types */

const NO_ALERTS = []

describe('AlertSnackbar', () => {
    test('does not render when no alerts', () => {
        useAlerts.mockImplementationOnce(jest.fn(() => NO_ALERTS))

        const store = {
            map: {
                mapViews: [
                    {
                        layer: 'facility',
                    },
                ],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <MapsAlertStack />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders map alerts', () => {
        useAlerts.mockImplementationOnce(jest.fn(() => NO_ALERTS))

        const store = {
            map: {
                mapViews: [
                    {
                        layer: 'facility',
                        alerts: [
                            {
                                warning: 'warning',
                                message: 'A warning from the mapviews',
                            },
                        ],
                    },
                ],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <MapsAlertStack />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders alerts from app-service-alerts', () => {
        useAlerts.mockImplementationOnce(
            jest.fn(() => [
                {
                    message: 'A successful result app-service-alerts',
                    options: {
                        success: 'success',
                    },
                    remove: jest.fn(),
                },
            ])
        )

        const store = {
            map: {
                mapViews: [
                    {
                        layer: 'facility',
                    },
                ],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <MapsAlertStack />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders alerts both map alerts and  app-service-alerts', () => {
        useAlerts.mockImplementationOnce(
            jest.fn(() => [
                {
                    message: 'A critical error from app-service-alerts',
                    options: {
                        critical: 'critical',
                    },
                    remove: jest.fn(),
                },
            ])
        )

        const store = {
            map: {
                mapViews: [
                    {
                        layer: 'facility',
                        alerts: [
                            {
                                warning: 'warning',
                                message: 'Another problem with facility layer',
                            },
                        ],
                    },
                ],
            },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <MapsAlertStack />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
