import i18n from '@dhis2/d2-i18n';
import { uniqBy } from 'lodash/fp';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getOrgUnitsFromRows } from '../util/analytics';
import { getDisplayProperty, getDisplayPropertyUrl } from '../util/helpers';

const colors = ['#111111', '#377eb8', '#a65628', '#984ea3', '#4daf4a'];

// TODO: Move to util and share with facility layuer
const parseGroupSet = ({ id, name, organisationUnitGroups }) => ({
    id,
    name,
    groups: organisationUnitGroups
        .toArray()
        .reduce((style, { id, name, color, symbol }, index) => {
            style[id] = {
                name,
                symbol,
                color: color || colors[index], // TODO
            };
            return style;
        }, {}),
});

// This function returns the org unit level names used in the legend
const getOrgUnitLevelNames = async d2 => {
    const orgUnitLevels = await d2.models.organisationUnitLevels.list({
        fields: `id,${getDisplayPropertyUrl(d2)},level`,
        paging: false,
    });

    return orgUnitLevels
        ? orgUnitLevels.toArray().reduce(
              (obj, item) => ({
                  ...obj,
                  [item.level]: item.name,
              }),
              {}
          )
        : {};
};

const getFeatureStyle = (dimensions, groupSet) =>
    dimensions && groupSet && dimensions[groupSet.id]
        ? groupSet.groups[dimensions[groupSet.id]]
        : {};

const styleFeatures = (
    features,
    groupSet,
    orgUnitLevelNames,
    { radiusLow }
) => {
    const levels = uniqBy(f => f.properties.level, features)
        .map(f => f.properties.level)
        .sort();

    const levelWeight = level =>
        Math.pow(levels.length - levels.indexOf(level), 1.2);

    const levelStyle = levels.reduce(
        (obj, level) => ({
            ...obj,
            [level]: {
                // color: colors[index] || '#333',
                color: '#333',
                weight: levelWeight(level),
            },
        }),
        {}
    );

    const styledFeatures = features.map(f => ({
        ...f,
        properties: {
            ...f.properties,
            // style: levelStyle[f.properties.level],
            labelStyle: {
                paddingTop:
                    f.geometry.type === 'Point'
                        ? 5 + (radiusLow || 5) + 'px'
                        : '0',
            },
            weight: levelWeight(f.properties.level),
            color: getFeatureStyle(f.properties.dimensions, groupSet).color,
            // strokeColor: levelStyle[f.properties.level].color,
        },
    }));

    const levelItems = levels.map(level => ({
        name: orgUnitLevelNames[level],
        ...levelStyle[level],
    }));

    const groupItems =
        groupSet && groupSet.groups
            ? Object.keys(groupSet.groups).map(id => ({
                  name: groupSet.groups[id].name,
                  color: groupSet.groups[id].color,
              }))
            : [];

    // console.log('groupItems', groupItems);

    return {
        styledFeatures,
        legend: {
            items: [...levelItems, ...groupItems],
        },
    };
};

// Returns a promise
const orgUnitLoader = async config => {
    const { rows, organisationUnitGroupSet } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);
    const includeGroupSets = !!organisationUnitGroupSet;

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();

    const requests = [
        d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty)
            .getAll({ includeGroupSets })
            .then(toGeoJson),
        getOrgUnitLevelNames(d2),
    ];

    if (organisationUnitGroupSet) {
        requests.push(
            d2.models.organisationUnitGroupSet
                .get(organisationUnitGroupSet.id, {
                    fields: `id,name,organisationUnitGroups[id,name,color,symbol]`,
                })
                .then(parseGroupSet)
        );
    }

    const [features, orgUnitLevelNames, groupSet] = await Promise.all(requests);

    const { styledFeatures, legend } = styleFeatures(
        features,
        groupSet,
        orgUnitLevelNames,
        config
    );

    const alerts = !features.length
        ? [{ warning: true, message: i18n.t('No org units found') }]
        : undefined;

    // console.log('styledFeatures', styledFeatures);

    return {
        ...config,
        data: styledFeatures,
        name: i18n.t('Org units'),
        legend,
        alerts,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default orgUnitLoader;
