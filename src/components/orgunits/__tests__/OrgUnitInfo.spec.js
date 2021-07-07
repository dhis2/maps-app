import React from 'react';
import { shallow } from 'enzyme';
import OrgUnitInfo, { coordFormat } from '../OrgUnitInfo';
import { formatDate } from '../../../util/time';

const defaultProps = {
    id: 'DiszpKrYNg8',
    groupSets: [],
    attributes: [],
};

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
];

const attributes = [
    {
        id: 'n2xYlNbsfko',
        label: 'NGO ID',
        value: 'ddASDd2312',
    },
];

// Helper function to get list item value
const getListItem = (wrapper, label) =>
    wrapper
        .find(`[label="${label}"]`)
        .dive()
        .find('td')
        .prop('children');

describe('Org unit profile (location details)', () => {
    const renderWithProps = props =>
        shallow(<OrgUnitInfo {...defaultProps} {...props} />);

    it('should render org unit name', () => {
        const name = 'Ngelehun CHC';
        const wrapper = renderWithProps({ name });

        expect(wrapper.find('h3').prop('children')).toEqual(name);
    });

    it('should render org unit level', () => {
        const level = 4;
        const levelName = 'Facility';

        expect(
            renderWithProps({ level })
                .find('[className="level"]')
                .prop('children')
        ).toContain(level);

        expect(
            renderWithProps({ levelName })
                .find('[className="level"]')
                .prop('children')
        ).toContain(levelName);

        expect(
            renderWithProps({ level, levelName })
                .find('[className="level"]')
                .prop('children')
        ).toContain(`${levelName} (${level})`);
    });

    it('should render org unit parent name', () => {
        const parentName = 'Badjia';
        const wrapper = renderWithProps({ parentName });

        expect(wrapper.find('[className="level"]').prop('children')).toContain(
            parentName
        );
    });

    it('should render org unit description', () => {
        const description = 'Org unit description';
        const wrapper = renderWithProps({ description });

        expect(wrapper.find('[className="desc"]').prop('children')).toContain(
            description
        );
    });

    it('should render fixed attributes in list', () => {
        const code = 'OU_559';
        const shortName = 'Ngelehun CHC';
        const comment = 'This is a comment';
        const contactPerson = 'John Traore';
        const address = 'Problemveien 7, 0315 Oslo, Norway';
        const email = 'john@dhis2test.org';
        const phoneNumber = '+47 22 85 50 50';
        const wrapper = renderWithProps({
            code,
            shortName,
            comment,
            contactPerson,
            address,
            email,
            phoneNumber,
        });

        expect(getListItem(wrapper, 'Code')).toEqual(code);
        expect(getListItem(wrapper, 'Short name')).toEqual(shortName);
        expect(getListItem(wrapper, 'Comment')).toEqual(comment);
        expect(getListItem(wrapper, 'Contact')).toEqual(contactPerson);
        expect(getListItem(wrapper, 'Address')).toEqual(address);
        expect(getListItem(wrapper, 'Email')).toEqual(email);
        expect(getListItem(wrapper, 'Phone')).toEqual(phoneNumber);
    });

    it('should render formatted dates', () => {
        const openingDate = '1970-01-01T00:00:00.000';
        const closedDate = '2021-06-09T00:00:00.000';
        const wrapper = renderWithProps({ openingDate, closedDate });
        const opening = getListItem(wrapper, 'Opening date');
        const closed = getListItem(wrapper, 'Closed date');

        expect(opening).not.toEqual(openingDate);
        expect(opening).toEqual(formatDate(openingDate));
        expect(closed).not.toEqual(closedDate);
        expect(closed).toEqual(formatDate(closedDate));
    });

    it('should render formatted longitude and latitude', () => {
        const longitude = -11.4197452367;
        const latitude = 8.103932863;
        const wrapper = renderWithProps({ longitude, latitude });
        const lng = getListItem(wrapper, 'Longitude');
        const lat = getListItem(wrapper, 'Latitude');

        expect(lng).not.toEqual(longitude);
        expect(lng).toEqual(coordFormat(longitude));
        expect(lat).not.toEqual(latitude);
        expect(lat).toEqual(coordFormat(latitude));
    });

    it('should render link for org unit url', () => {
        const url = 'https://dhis2.org/';
        const wrapper = renderWithProps({ url });

        expect(
            wrapper
                .find(`[label="URL"]`)
                .dive()
                .find('a')
                .prop('href')
        ).toEqual(url);
    });

    it('should render org unit group memberships', () => {
        const wrapper = renderWithProps({ groupSets });

        groupSets.forEach(({ label, value }) => {
            expect(getListItem(wrapper, label)).toEqual(value);
        });
    });

    it('should render metadata attributes', () => {
        const wrapper = renderWithProps({ attributes });

        attributes.forEach(({ label, value }) => {
            expect(getListItem(wrapper, label)).toEqual(value);
        });
    });
});
