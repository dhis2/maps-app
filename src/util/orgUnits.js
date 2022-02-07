import { uniqBy } from 'lodash/fp';
import i18n from '@dhis2/d2-i18n';
import { apiFetch } from './api';
import { getDisplayPropertyUrl } from './helpers';
import { toGeoJson } from './map';
import { getUniqueColor } from './colors';
import { qualitativeColors } from '../constants/colors';
import {
    ORG_UNIT_COLOR,
    ORG_UNIT_RADIUS,
    STYLE_TYPE_COLOR,
    STYLE_TYPE_SYMBOL,
} from '../constants/layers';

const getGroupColor = groups => {
    const groupsWithoutColors = groups.filter(g => !g.color);
    const colors = getUniqueColor(qualitativeColors);
    return group => {
        const index = groupsWithoutColors.findIndex(g => g.id === group.id);
        return colors(index);
    };
};

// Default symbol 21-25 are coloured circles
const getGroupSymbol = groups => {
    const groupsWithoutSymbols = groups.filter(g => !g.symbol);
    return group => {
        const index = groupsWithoutSymbols.findIndex(g => g.id === group.id);
        return index < 5 ? `${21 + index}.png` : '25.png';
    };
};

const parseGroupSet = ({ organisationUnitGroups: groups }) => {
    groups.sort((a, b) => a.name.localeCompare(b.name));

    const getColor = getGroupColor(groups);
    const getSymbol = getGroupSymbol(groups);

    return groups.map(group => ({
        ...group,
        color: group.color || getColor(group),
        symbol: group.symbol || getSymbol(group),
    }));
};

export const fetchOrgUnitGroupSet = id =>
    apiFetch(
        `/organisationUnitGroupSets/${id}?fields=organisationUnitGroups[id,name,color,symbol]`
    ).then(parseGroupSet);

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
    { organisationUnitColor = ORG_UNIT_COLOR, radiusLow = ORG_UNIT_RADIUS },
    contextPath,
    orgUnitLevels
) => {
    const {
        name,
        styleType = orgUnitLevels ? STYLE_TYPE_COLOR : STYLE_TYPE_SYMBOL,
        organisationUnitGroups = [],
    } = groupSet;
    const isFacilityLayer = !orgUnitLevels;
    let levelWeight;
    let levelItems = [];

    if (!isFacilityLayer) {
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

    let styledFeatures = features.map(f => {
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

    // Only include facilities having a group membership
    if (isFacilityLayer && groupSet.id && !useColor) {
        styledFeatures = styledFeatures.filter(f => f.properties.iconUrl);
    }

    const groupItems = getOrgUnitGroupLegendItems(
        organisationUnitGroups,
        useColor,
        contextPath
    );

    const facilityItems =
        isFacilityLayer && !groupSet.id
            ? [
                  {
                      name: i18n.t('Facility'),
                      color: organisationUnitColor,
                      radius: radiusLow,
                  },
              ]
            : [];

    return {
        styledFeatures,
        legend: {
            unit: name,
            items: [...levelItems, ...groupItems, ...facilityItems],
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

// Loads default org unit level and group set for facility layer
export const fetchFacilityConfigurations = async () => {
    const [facilityOrgUnitLevel, facilityOrgUnitGroupSet] = await Promise.all([
        apiFetch('/configuration/facilityOrgUnitLevel'),
        apiFetch('/configuration/facilityOrgUnitGroupSet'),
    ]);

    return {
        facilityOrgUnitLevel,
        facilityOrgUnitGroupSet,
    };
};

// TODO
export const fetchAssociatedGeometries = () =>
    fetch('temp/bargbe-catchment-areas.json')
        .then(response => response.json())
        .then(toGeoJson);
