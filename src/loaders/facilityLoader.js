import i18next from 'i18next';
import isObject from 'd2-utilizr/lib/isObject';
import { getInstance as getD2 } from 'd2/lib/d2';
import { isValidCoordinate } from '../util/map';
import { getDisplayPropertyUrl } from '../util/helpers';
import { getOrgUnitsFromRows } from '../util/analytics';

const facilityLoader = async (config) => { // Returns a promise
    console.log('config', config);

    const { organisationUnitGroupSet, rows } = config;
    const groupSetId = organisationUnitGroupSet.id;
    const orgUnits = getOrgUnitsFromRows(rows);
    let orgUnitParams = orgUnits.map(item => item.id);

    const d2 = await getD2();
    const contextPath = d2.system.systemInfo.contextPath;
    const displayProperty = d2.currentUser.settings.keyAnalysisDisplayProperty || 'name'; // TODO
    const namePropertyUrl = getDisplayPropertyUrl(displayProperty);

    const groupSetReq = d2.models.organisationUnitGroupSet.get(groupSetId, {
        fields: `organisationUnitGroups[id,${namePropertyUrl},symbol]`,
    }).then(parseGroupSet);

    const facilitiesReq = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty.toUpperCase())
        .getAll({
            includeGroupSets: true,
        })
        .then(facilities => parseFacilities(facilities, groupSetId));

    const [ groupSet, facilities ] = await Promise.all([groupSetReq, facilitiesReq]);

    // Convert API response to GeoJSON features
    const features = facilities.map(facility => {
        const id = facility.dimensions[groupSetId];
        return toGeoJson(facility, groupSet[id], contextPath);
    });

    return {
        ...config,
        data: features,
        title: i18next.t('Facilities'),
        legend: {
            items: Object.keys(groupSet).map(id => ({
                image: `${contextPath}/images/orgunitgroup/${groupSet[id].symbol}`,
                name: groupSet[id].name,
            })),
        },
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

const parseFacilities = (facilities, groupSetId) =>
    facilities.filter(facility => ( // Only add valid points belonging to an org.unit group
        facility.ty === 1 &&
        isObject(facility.dimensions) &&
        facility.dimensions[groupSetId] &&
        isValidCoordinate(JSON.parse(facility.co))
    ));

const parseGroupSet = (groupSet) =>
    groupSet.organisationUnitGroups.toArray().reduce((symbols, group, index) => { // Easier lookup of unit group symbols
        group.symbol = group.symbol || (21 + index) + '.png'; // Default symbol 21-25 are coloured circles
        symbols[group.id] = group;
        return symbols;
    }, {});


const toGeoJson = (facility, group, contextPath) => ({
    type: 'Feature',
    id: facility.id,
    properties: {
        id: facility.id,
        name: facility.na,
        label: `${facility.na} (${group.name})`,
        icon: {
            iconUrl: `${contextPath}/images/orgunitgroup/${group.symbol}`,
            iconSize: [16, 16],
        }
    },
    geometry: {
        type: 'Point',
        coordinates: JSON.parse(facility.co),
    }
});


export default facilityLoader;
