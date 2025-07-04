import { render } from '@testing-library/react'
import React from 'react'
import OrgUnitInfo from '../OrgUnitInfo.jsx'

jest.mock('@dhis2/app-runtime', () => ({
    useConfig: jest.fn(() => ({ baseUrl: 'dhis2' })),
}))

const groupSets = [
    {
        id: 'Bpx0589u8y0',
        label: 'Facility Ownership',
        value: 'Public facilities',
    },
    {
        id: 'J5jldMd8OHv',
        label: 'Facility Type',
        value: 'CHC',
    },
]

const attributes = [
    {
        id: 'n2xYlNbsfko',
        label: 'NGO ID',
        value: 'ddASDd2312',
    },
]

const allProps = {
    address: 'Port Loko 1',
    attributes: [],
    closedDate: '',
    code: 'PL',
    comment: 'This is the comment',
    contactPerson: 'Johnny',
    description: 'The district of Port Loko',
    email: 'portloko@dhis2.org',
    featureType: '',
    groupSets: [],
    id: 'portlokoid',
    imageId: '',
    latitude: 8.103932863,
    level: 2,
    levelName: 'District',
    longitude: -11.4197452367,
    name: 'Port Loko',
    openingDate: '1970-01-01T00:00:00.000',
    parentName: 'Sierra Leone',
    phoneNumber: '123-456-7890',
    shortName: 'PLoko',
    url: 'portloko.dhis2.org',
}

describe('Org unit profile (location details)', () => {
    it('renders OrgUnitInfo', () => {
        const { container } = render(<OrgUnitInfo {...allProps} />)
        expect(container).toMatchSnapshot()
    })

    it('renders formatted dates if featureType is POINT', () => {
        const { container } = render(
            <OrgUnitInfo
                {...allProps}
                featureType="POINT"
                closedDate="2021-06-09T00:00:00.000"
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('renders org unit group memberships', () => {
        const { container } = render(
            <OrgUnitInfo {...allProps} groupSets={groupSets} />
        )
        expect(container).toMatchSnapshot()
    })

    it('renders metadata attributes', () => {
        const { container } = render(
            <OrgUnitInfo {...allProps} attributes={attributes} />
        )
        expect(container).toMatchSnapshot()
    })

    it('renders with minimal properties', () => {
        const { container } = render(
            <OrgUnitInfo
                id="portloko123"
                email="johnny@dhis2.org"
                attributes={[]}
                groupSets={[]}
            />
        )
        expect(container).toMatchSnapshot()
    })
})
