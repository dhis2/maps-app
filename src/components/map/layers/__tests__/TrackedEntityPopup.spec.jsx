import { useDataQuery } from '@dhis2/app-runtime'
import { render } from '@testing-library/react'
import React from 'react'
import TrackedEntityPopup from '../TrackedEntityPopup.jsx'

jest.mock('@dhis2/app-runtime', () => ({ useDataQuery: jest.fn() }))
jest.mock('../../Popup.jsx', () => () => null)

describe('TrackedEntityPopup', () => {
    it('requests only the fields it shows', () => {
        useDataQuery.mockReturnValue({
            refetch: jest.fn().mockResolvedValue({}),
            fetching: false,
        })

        render(
            <TrackedEntityPopup
                coordinates={[0, 0]}
                feature={{
                    properties: { id: 'te1' },
                    geometry: { type: 'Point', coordinates: [0, 0] },
                }}
                program={{ id: 'program1' }}
                nameProperty="displayName"
                displayAttributes={[]}
                onClose={jest.fn()}
            />
        )

        const [query, { variables }] = useDataQuery.mock.calls.find(
            ([query]) => query.trackedEntities
        )
        expect(query.trackedEntities.resource).toBe('tracker/trackedEntities')
        expect(query.trackedEntities.params(variables)).toEqual({
            fields: 'updatedAt,orgUnit,attributes[displayName~rename(name),value,attribute]',
            program: 'program1',
        })
    })
})
