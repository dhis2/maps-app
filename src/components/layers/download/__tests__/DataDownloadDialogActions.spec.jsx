import { render } from '@testing-library/react'
import React from 'react'
import DataDownloadDialogActions from '../DataDownloadDialogActions.jsx'

/* eslint-disable react/prop-types */
jest.mock('@dhis2/ui', () => {
    const originalModule = jest.requireActual('@dhis2/ui')

    return {
        __esModule: true,
        ...originalModule,
        Button: function Mock({ children }) {
            return <div className="ui-Button">{children}</div>
        },
        ButtonStrip: function Mock({ children }) {
            return <div className="ui-ButtonStrip">{children}</div>
        },
        CircularLoader: function Mock({ children }) {
            return <div className="ui-CircularLoader">{children}</div>
        },
    }
})
/* eslint-enable react/prop-types */

describe('DataDownloadDialogActions', () => {
    it('Should render two buttons and NO loading spinner when not loading', () => {
        const { container } = render(
            <DataDownloadDialogActions
                downloading={false}
                onStartClick={jest.fn()}
                onCancelClick={jest.fn()}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('Should render two buttons and show loading spinner when loading', () => {
        const { container } = render(
            <DataDownloadDialogActions
                downloading={true}
                onStartClick={jest.fn()}
                onCancelClick={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })
})
