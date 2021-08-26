import i18n from '@dhis2/d2-i18n';
import { uniqBy } from 'lodash/fp';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getOrgUnitsFromRows } from '../util/analytics';
import { getDisplayProperty, getDisplayPropertyUrl } from '../util/helpers';
import { ORG_UNIT_COLOR, STYLE_TYPE_COLOR } from '../constants/layers';

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

// TODO: share with facility layer
const getFeatureStyle = (dimensions, groupSet) =>
    groupSet &&
    groupSet.organisationUnitGroups &&
    dimensions &&
    dimensions[groupSet.id]
        ? groupSet.organisationUnitGroups.find(
              g => g.id === dimensions[groupSet.id]
          )
        : {};

const styleFeatures = (
    features,
    groupSet = {},
    orgUnitLevelNames,
    { organisationUnitColor = ORG_UNIT_COLOR, radiusLow },
    contextPath
) => {
    const {
        styleType = STYLE_TYPE_COLOR,
        organisationUnitGroups = [],
    } = groupSet;

    // TODO: Load organisationUnitGroups if not present

    const useColor = styleType === STYLE_TYPE_COLOR;

    const levels = uniqBy(f => f.properties.level, features)
        .map(f => f.properties.level)
        .sort();

    const levelWeight = level =>
        Math.pow(levels.length - levels.indexOf(level), 1.2);

    const levelStyle = levels.reduce(
        (obj, level) => ({
            ...obj,
            [level]: {
                color: organisationUnitColor,
                weight: levelWeight(level),
            },
        }),
        {}
    );

    const styledFeatures = features.map(f => {
        const weight = levelWeight(f.properties.level);
        const { color, symbol } = getFeatureStyle(
            f.properties.dimensions,
            groupSet
        );
        const radius = f.geometry.type === 'Point' ? radiusLow : undefined;
        const properties = {
            ...f.properties,
            weight,
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

    const levelItems = levels.map(level => ({
        name: orgUnitLevelNames[level],
        ...levelStyle[level],
    }));

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
            items: [...levelItems, ...groupItems],
        },
    };
};

// Returns a promise
const orgUnitLoader = async config => {
    const { rows, organisationUnitGroupSet: groupSet } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);
    const includeGroupSets = !!groupSet;

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();
    const { contextPath } = d2.system.systemInfo;

    const requests = [
        d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty)
            .getAll({ includeGroupSets })
            .then(toGeoJson),
        getOrgUnitLevelNames(d2),
    ];

    const [features, orgUnitLevelNames] = await Promise.all(requests);

    const { styledFeatures, legend } = styleFeatures(
        features,
        groupSet,
        orgUnitLevelNames,
        config,
        contextPath
    );

    const alerts = !features.length
        ? [{ warning: true, message: i18n.t('No org units found') }]
        : undefined;

    return {
        ...config,
        data: styledFeatures,
        name: i18n.t('Organisation units'),
        legend,
        alerts,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default orgUnitLoader;
