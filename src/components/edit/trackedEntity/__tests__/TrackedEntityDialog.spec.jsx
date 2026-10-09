import { useConfig } from '@dhis2/app-runtime'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import TrackedEntityDialog from '../TrackedEntityDialog.jsx'

jest.mock('@dhis2/app-runtime', () => ({ useConfig: jest.fn() }))
jest.mock('react-redux', () => ({ useDispatch: () => jest.fn() }))
jest.mock(
    '../../../trackedEntity/TrackedEntityTypeSelect.jsx',
    () => () => null
)
jest.mock('../../../program/ProgramSelect.jsx', () => () => null)
jest.mock('../ProgramStatusSelect.jsx', () => () => null)
jest.mock('../PeriodTypeSelect.jsx', () => () => null)
jest.mock('../TrackedEntityRelationshipTypeSelect.jsx', () => () => null)
jest.mock('../../../orgunits/OrgUnitSelect.jsx', () => () => null)
jest.mock('../../../periods/StartEndDate.jsx', () => () => null)
jest.mock('../../shared/BufferRadius.jsx', () => () => null)

const trackerData =
    /loaded directly from captured data, not from analytics tables/

const renderDialog = ({ minor = 43, ...props } = {}) => {
    useConfig.mockReturnValue({ serverVersion: { minor } })
    render(
        <TrackedEntityDialog
            trackedEntityType={{ id: 'teType1', name: 'Person' }}
            program={{ id: 'program1', name: 'Malaria case' }}
            startDate="2024-01-01"
            endDate="2024-12-31"
            rows={[]}
            validateLayer={false}
            onLayerValidation={jest.fn()}
            {...props}
        />
    )
}

describe('TrackedEntityDialog tracker data notice', () => {
    it('explains the access rules when follow-up is checked on 2.41+', () => {
        renderDialog({ followUp: true })

        expect(screen.getByText(trackerData)).toBeInTheDocument()
    })

    it.each([
        { name: 'without follow-up', props: { followUp: false } },
        { name: 'on 2.40', props: { followUp: true, minor: 40 } },
    ])('does not show it $name', ({ props }) => {
        renderDialog(props)

        expect(screen.queryByText(trackerData)).not.toBeInTheDocument()
    })

    it('explains the access rules when relationships are shown on 2.41+', () => {
        renderDialog({ relationshipType: 'relType1' })
        fireEvent.click(screen.getByText('Relationships'))

        expect(screen.getByText(trackerData)).toBeInTheDocument()
    })

    it('does not show it for relationships on 2.40', () => {
        renderDialog({ relationshipType: 'relType1', minor: 40 })
        fireEvent.click(screen.getByText('Relationships'))

        expect(screen.queryByText(trackerData)).not.toBeInTheDocument()
    })
})
