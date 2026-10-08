import { useDataQuery } from '@dhis2/app-runtime'
import { render, screen } from '@testing-library/react'
import React from 'react'
import TrackedEntityRelationshipTypeSelect from '../TrackedEntityRelationshipTypeSelect.jsx'

jest.mock('@dhis2/app-runtime', () => ({ useDataQuery: jest.fn() }))
jest.mock('../../../core/index.js', () => {
    const PropTypes = require('prop-types')
    const SelectField = ({ items }) => (
        <ul>
            {items.map(({ id, name }) => (
                <li key={id}>{name}</li>
            ))}
        </ul>
    )
    SelectField.propTypes = { items: PropTypes.array }
    return { SelectField }
})

const trackedEntity = (id) => ({
    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
    trackedEntityType: { id },
})
const event = { relationshipEntity: 'PROGRAM_STAGE_INSTANCE' }
const enrollment = { relationshipEntity: 'PROGRAM_INSTANCE' }

const relationshipTypes = [
    {
        id: 'r1',
        name: 'Case to contact',
        fromConstraint: trackedEntity('person'),
        toConstraint: trackedEntity('person'),
    },
    {
        id: 'r2',
        name: 'Case to visit',
        fromConstraint: trackedEntity('person'),
        toConstraint: event,
    },
    {
        id: 'r3',
        name: 'Case to enrollment',
        fromConstraint: trackedEntity('person'),
        toConstraint: enrollment,
    },
    {
        id: 'r4',
        name: 'Focus to case',
        fromConstraint: trackedEntity('focus'),
        toConstraint: trackedEntity('person'),
    },
    {
        id: 'r5',
        name: 'Visit to case',
        fromConstraint: event,
        toConstraint: trackedEntity('person'),
    },
]

const renderSelect = () =>
    render(
        <TrackedEntityRelationshipTypeSelect
            trackedEntityType={{ id: 'person', name: 'Person' }}
            onChange={jest.fn()}
        />
    )

describe('TrackedEntityRelationshipTypeSelect', () => {
    it('offers the relationships from the type to tracked entities', () => {
        useDataQuery.mockReturnValue({
            data: { relationshipTypes: { relationshipTypes } },
        })
        renderSelect()

        expect(
            screen.getAllByRole('listitem').map((item) => item.textContent)
        ).toEqual(['Case to contact'])
    })

    it('says when the type has none', () => {
        useDataQuery.mockReturnValue({
            data: {
                relationshipTypes: {
                    relationshipTypes: relationshipTypes.slice(1),
                },
            },
        })
        renderSelect()

        expect(
            screen.getByText(
                'No relationship types were found for tracked entity type Person'
            )
        ).toBeInTheDocument()
    })
})
