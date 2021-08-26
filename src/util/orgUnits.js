import { uniqBy } from 'lodash/fp';
import { getDisplayPropertyUrl } from '../util/helpers';
import {
    ORG_UNIT_COLOR,
    STYLE_TYPE_COLOR,
    STYLE_TYPE_SYMBOL,
} from '../constants/layers';

export const filterPointFacilities = data => data.filter(d => d.ty === 1);

export const getOrgUnitStyle = (dimensions, groupSet) =>
    groupSet &&
    groupSet.organisationUnitGroups &&
    dimensions &&
    dimensions[groupSet.id]
        ? groupSet.organisationUnitGroups.find(
              g => g.id === dimensions[groupSet.id]
          )
        : {};

export const getOrgUnitGroupLegendItems = (
    groups = [],
    useColor,
    contextPath
) =>
    groups.map(({ name, color = true, symbol }) =>
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

export const getStyledOrgUnits = (
    features,
    groupSet = {},
    { organisationUnitColor = ORG_UNIT_COLOR, radiusLow },
    contextPath,
    orgUnitLevels
) => {
    const {
        name,
        styleType = STYLE_TYPE_SYMBOL,
        organisationUnitGroups = [],
    } = groupSet;
    let levelWeight;
    let levelItems = [];

    if (orgUnitLevels) {
        const levels = uniqBy(f => f.properties.level, features)
            .map(f => f.properties.level)
            .sort();

        levelWeight = level =>
            Math.pow(levels.length - levels.indexOf(level), 1.2);

        levelItems = levels.map(level => ({
            name: orgUnitLevels[level],
            color: organisationUnitColor,
            weight: levelWeight(level),
        }));
    }

    const useColor = styleType === STYLE_TYPE_COLOR;

    const styledFeatures = features.map(f => {
        const { color, symbol } = getOrgUnitStyle(
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

        if (properties.level && levelWeight) {
            properties.weight = levelWeight(f.properties.level);
        }

        return {
            ...f,
            properties,
        };
    });

    const groupItems = getOrgUnitGroupLegendItems(
        organisationUnitGroups,
        useColor,
        contextPath
    );

    return {
        styledFeatures,
        legend: {
            unit: name,
            items: [...levelItems, ...groupItems],
        },
    };
};

// This function returns the org unit level names used in the legend
export const getOrgUnitLevels = async d2 => {
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
