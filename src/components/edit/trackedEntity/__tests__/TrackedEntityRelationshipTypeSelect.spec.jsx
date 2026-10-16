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

const relationshipTypes = [{ id: 'r1', name: 'Case to contact' }]

const renderSelect = () =>
    render(
        <TrackedEntityRelationshipTypeSelect
            trackedEntityType={{ id: 'person', name: 'Person' }}
            onChange={jest.fn()}
        />
    )

describe('TrackedEntityRelationshipTypeSelect', () => {
    it('requests all relationship types between tracked entities from the type', () => {
        useDataQuery.mockReturnValue({ loading: true })
        renderSelect()

        const [query, { variables }] = useDataQuery.mock.calls[0]
        expect(variables).toEqual({ trackedEntityType: 'person' })
        expect(query.relationshipTypes.params(variables)).toEqual({
            fields: ['id', 'displayName~rename(name)'],
            filter: [
                'fromConstraint.relationshipEntity:eq:TRACKED_ENTITY_INSTANCE',
                'toConstraint.relationshipEntity:eq:TRACKED_ENTITY_INSTANCE',
                'fromConstraint.trackedEntityType.id:eq:person',
            ],
            paging: false,
        })
    })

    it('offers the returned relationship types', () => {
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
            data: { relationshipTypes: { relationshipTypes: [] } },
        })
        renderSelect()

        expect(
            screen.getByText(
                'No relationship types were found for tracked entity type Person'
            )
        ).toBeInTheDocument()
    })
})
