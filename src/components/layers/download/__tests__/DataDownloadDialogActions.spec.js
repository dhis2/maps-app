import { render } from '@testing-library/react'
import React from 'react'
import DataDownloadDialogActions from '../DataDownloadDialogActions.js'

describe('DataDownloadDialogActions', () => {
    it('Should render two buttons and NO loading spinner', () => {
        const { container } = render(
            <DataDownloadDialogActions
                downloading={false}
                onStartClick={jest.fn()}
                onCancelClick={jest.fn()}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('Should disable buttons and show loading spinner when loading', () => {
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
