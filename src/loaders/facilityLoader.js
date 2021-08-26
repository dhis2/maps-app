import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getDisplayProperty } from '../util/helpers';
import { getOrgUnitsFromRows } from '../util/analytics';
import { STYLE_TYPE_COLOR, STYLE_TYPE_SYMBOL } from '../constants/layers';

// TODO: share with org unit layer
const getFeatureStyle = (dimensions, groupSet) =>
    groupSet &&
    groupSet.organisationUnitGroups &&
    dimensions &&
    dimensions[groupSet.id]
        ? groupSet.organisationUnitGroups.find(
              g => g.id === dimensions[groupSet.id]
          )
        : {};

const styleFeatures = (features, groupSet = {}, { radiusLow }, contextPath) => {
    const {
        styleType = STYLE_TYPE_SYMBOL,
        organisationUnitGroups = [],
    } = groupSet;

    // TODO: Load organisationUnitGroups if not present

    const useColor = styleType === STYLE_TYPE_COLOR;

    // console.log('styleFeatures', features, groupSet, config, contextPath);

    const styledFeatures = features.map(f => {
        const { color, symbol } = getFeatureStyle(
            f.properties.dimensions,
            groupSet
        );
        const radius = f.geometry.type === 'Point' ? radiusLow : undefined;
        const properties = {
            ...f.properties,
            radius,
        };

        if (useColor && color) {
            properties.color = color;
        } else if (symbol) {
            properties.iconUrl = `${contextPath}/images/orgunitgroup/${symbol}`;
        }

        return {
            ...f,
            properties,
        };
    });

    const groupItems = organisationUnitGroups.map(({ name, color, symbol }) =>
        useColor
            ? {
                  name,
                  color,
              }
            : {
                  name,
                  image: `${contextPath}/images/orgunitgroup/${symbol}`,
              }
    );

    return {
        styledFeatures,
        legend: {
            items: [...groupItems],
        },
    };
};

const facilityLoader = async config => {
    // Returns a promise
    const { rows, organisationUnitGroupSet: groupSet } = config; // areaRadius
    // const groupSetId = organisationUnitGroupSet.id;
    const orgUnits = getOrgUnitsFromRows(rows);
    const includeGroupSets = !!groupSet;
    const name = i18n.t('Facilities');
    let orgUnitParams = orgUnits.map(item => item.id);
    let alert;
    // let features;

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();
    const { contextPath } = d2.system.systemInfo;

    const requests = [
        d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty)
            .getAll({
                includeGroupSets,
            })
            // .then(facilities => parseFacilities(facilities, groupSetId))
            .then(toGeoJson)
            .catch(error => {
                if (error && error.message) {
                    alert = {
                        critical: true,
                        message: `${i18n.t('Error')}: ${error.message}`,
                    };
                }
            }),
    ];

    // TODO: Load organisationUnitGroups if not passed
    /*
    const groupSetReq = d2.models.organisationUnitGroupSet
        .get(groupSetId, {
            fields: `organisationUnitGroups[id,${displayProperty}~rename(name),symbol]`,
        })
        .then(parseGroupSet);
    */

    /*    
    const facilitiesReq = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty.toUpperCase())
        .getAll({
            includeGroupSets: true,
        })
        .then(facilities => parseFacilities(facilities, groupSetId))
        .catch(error => {
            if (error && error.message) {
                alert = {
                    critical: true,
                    message: `${i18n.t('Error')}: ${error.message}`,
                };
            }
        });

    const [groupSet, facilities] = await Promise.all([
        groupSetReq,
        facilitiesReq,
    ]);
    */

    const [features] = await Promise.all(requests);

    /*
    if (groupSet && facilities) {
        // Convert API response to GeoJSON features
        features = facilities.map(facility => {
            const id = facility.dimensions[groupSet.id];
            return toGeoJson(facility, groupSet[id], contextPath);
        });

        features = facilities;

        legend = {
            title: name,
            unit: groupSet.name,
            items: Object.keys(groupSet).map(id => ({
                image: `${contextPath}/images/orgunitgroup/${groupSet[id].symbol}`,
                name: groupSet[id].name,
            })),
        };

        if (areaRadius) {
            legend.explanation = [`${areaRadius} ${'m'} ${'buffer'}`];
        }
    }
    */

    const { styledFeatures, legend } = styleFeatures(
        features,
        groupSet,
        config,
        contextPath
    );

    return {
        ...config,
        data: styledFeatures,
        name,
        legend,
        alerts: alert ? [alert] : undefined,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

/*
const parseFacilities = (facilities, groupSetId) =>
    facilities.filter(
        (
            facility // Only add valid points belonging to an org.unit group
        ) =>
            facility.ty === 1 &&
            isPlainObject(facility.dimensions) &&
            facility.dimensions[groupSetId] &&
            isValidCoordinate(JSON.parse(facility.co))
    );
*/

/*
const parseGroupSet = groupSet =>
    groupSet.organisationUnitGroups
        .toArray()
        .reduce((symbols, group, index) => {
            // Easier lookup of unit group symbols
            group.symbol = group.symbol || 21 + index + '.png'; // Default symbol 21-25 are coloured circles
            symbols[group.id] = group;
            return symbols;
        }, {});
*/

/*
const toGeoJson = (facility, group, contextPath) => ({
    type: 'Feature',
    id: facility.id,
    properties: {
        id: facility.id,
        name: facility.na,
        label: `${facility.na} (${group.name})`,
        iconUrl: `${contextPath}/images/orgunitgroup/${group.symbol}`,
        type: 'Point', // Accessible in data table
    },
    geometry: {
        type: 'Point',
        coordinates: JSON.parse(facility.co),
    },
});
*/

export default facilityLoader;
