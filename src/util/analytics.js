import i18n from '@dhis2/d2-i18n';
import { sortBy, negate } from 'lodash/fp';
import { isValidUid } from 'd2/uid';
import { getPeriodNames } from './periods';
import { dimConf } from '../constants/dimension';
import {
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../constants/layers';

/* DIMENSIONS */

const createDimension = (dimension, items, props) => ({
    dimension,
    items,
    ...props,
});

const getDimension = (dimension, arr) =>
    arr.filter(item => item.dimension === dimension)[0];

const getDimensionItems = (dimension, arr) => {
    const dataItems = getDimension(dimension, arr);
    return dataItems && dataItems.items ? dataItems.items : [];
};

/* DATA ITEM */

export const getDataItemFromColumns = (columns = []) =>
    getDimensionItems('dx', columns)[0];

export const setDataItemInColumns = (dataItem, dimension) => {
    const dim = dimConf[dimension];
    return dim
        ? [
              createDimension(
                  dim.dimensionName,
                  [
                      {
                          id:
                              dataItem.id +
                              (dimension === 'reportingRate'
                                  ? '.REPORTING_RATE'
                                  : ''),
                          name: dataItem.name,
                          dimensionItemType: dim.itemType,
                          legendSet: dataItem.legendSet, // TODO: Keep outside of columns?
                      },
                  ],
                  { objectName: dim.objectName }
              ),
          ]
        : [];
};

/* ORGANISATION UNIT */

export const getOrgUnitsFromRows = (rows = []) =>
    getDimensionItems('ou', rows) || [];

/* ORGANISATION UNIT NODES */

const isOrgUnitNode = ou => isValidUid(ou.id);

export const getOrgUnitNodesFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows).filter(isOrgUnitNode);

export const toggleOrgUnitNodeInRows = (rows = [], orgUnit) => {
    const orgUnits = getOrgUnitsFromRows(rows);
    const hasOrgUnit = orgUnits.some(ou => ou.id === orgUnit.id);
    return [
        createDimension(
            'ou',
            hasOrgUnit
                ? orgUnits.filter(ou => ou.id !== orgUnit.id)
                : [...orgUnits, { ...orgUnit }]
        ),
    ];
};

/* ORGANISATION UNIT LEVELS */

const isOrgUnitLevel = ou => ou.id.substring(0, 6) === 'LEVEL-';
const getIdFromOrgUnitLevel = ou => ou.id.substring(6);
const createOrgUnitLevel = id => ({ id: `LEVEL-${id}` });

export const getOrgUnitLevelsFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows)
        .filter(isOrgUnitLevel)
        .map(getIdFromOrgUnitLevel);

export const addOrgUnitLevelsToRows = (rows = [], levels = []) => [
    createDimension('ou', [
        ...getOrgUnitsFromRows(rows).filter(negate(isOrgUnitLevel)),
        ...levels.map(createOrgUnitLevel),
    ]),
];

/* ORGANISATION UNIT GROUPS */

const isOrgUnitGroup = ou => ou.id.substring(0, 9) === 'OU_GROUP-';
const getIdFromOrgUnitGroup = ou => ou.id.substring(9);
const createOrgUnitGroup = id => ({ id: `OU_GROUP-${id}` });

export const getOrgUnitGroupsFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows)
        .filter(isOrgUnitGroup)
        .map(getIdFromOrgUnitGroup);

export const addOrgUnitGroupsToRows = (rows = [], levels = []) => [
    createDimension('ou', [
        ...getOrgUnitsFromRows(rows).filter(negate(isOrgUnitGroup)),
        ...levels.map(createOrgUnitGroup),
    ]),
];

/* ORGANISATION UNIT PATH */
// Set organisation unit tree path (temporary solution, as favorites don't include paths)
export const setOrgUnitPathInRows = (rows = [], id, path) => {
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnit = orgUnits.find(ou => ou.id === id);
    return [
        createDimension('ou', [
            ...orgUnits.filter(ou => ou.id !== id),
            { ...orgUnit, path },
        ]),
    ];
};

/* USER ORGANISATION UNITS */

const isUserOrgUnit = ou => ou.id.substring(0, 12) === 'USER_ORGUNIT';
const getIdFromUserOrgUnit = ou => ou.id;
const createUserOrgUnit = id => ({ id });

export const getUserOrgUnitsFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows)
        .filter(isUserOrgUnit)
        .map(getIdFromUserOrgUnit);

// Adding user org units will clear other org unit selections
export const createUserOrgUnitsDimension = (userOrgUnits = []) => [
    createDimension('ou', [...userOrgUnits.map(createUserOrgUnit)]),
];

/* PERIODS */

export const getPeriodFromFilters = (filters = []) =>
    getDimensionItems('pe', filters)[0];

export const removePeriodFromFilters = (filters = []) => [
    ...filters.filter(f => f.dimension !== 'pe'),
];

export const getPeriodNameFromId = id => getPeriodNames()[id];

export const setFiltersFromPeriod = (filters, period) => [
    ...removePeriodFromFilters(filters),
    createDimension('pe', [{ ...period }]),
];

/* DYNAMIC DIMENSION FILTERS */

export const getDimensionsFromFilters = (filters = []) =>
    filters.filter(d => isValidUid(d.dimension) || d.dimension === null);

export const getValidDimensionsFromFilters = (filters = []) =>
    filters.filter(d => isValidUid(d.dimension) && d.items && d.items.length);

export const removeDimensionFromFilters = (filters, index) => {
    const dimensions = getDimensionsFromFilters(filters);

    if (!dimensions || !dimensions[index]) {
        return filters;
    }

    return [
        ...filters.filter(f => f.dimension === 'pe'),
        ...dimensions.filter((d, i) => i !== index),
    ];
};

export const changeDimensionInFilters = (filters, index, filter) => {
    const dimensions = getDimensionsFromFilters(filters);

    if (!dimensions || !dimensions[index]) {
        return filters;
    }

    dimensions[index] = filter;

    return [...filters.filter(f => f.dimension === 'pe'), ...dimensions];
};

/* FILTERS */

export const getFiltersFromColumns = (columns = []) => {
    const filters = columns.filter(item => item.filter);
    return filters.length ? filters : null;
};

// Returns list of filters in a readable format
export const getFiltersAsText = (filters = [], names = {}) =>
    filters.map(({ dimension, filter }) => {
        const [operator, value] = filter.split(':');
        const filterName = names[dimension];
        const filterOperator = getFilterOperatorAsText(operator, value);
        const filterValue = getFilterValueName(value, operator, names);

        return `${filterName} ${filterOperator} ${filterValue}`;
    });

// Returns filter operator in a readable format
export const getFilterOperatorAsText = (operator, value) => {
    // If only one value, use is / is not
    if (!value.includes(';')) {
        if (operator === 'IN') {
            return i18n.t('is');
        } else if (operator === '!IN') {
            return i18n.t('is not');
        }
    }

    return {
        EQ: '=',
        GT: '>',
        GE: '>=',
        LT: '<',
        LE: '<=',
        NE: '!=',
        IN: i18n.t('one of'),
        '!IN': i18n.t('not one of'),
        LIKE: i18n.t('contains'),
        '!LIKE': i18n.t("doesn't contains"),
    }[operator];
};

// Returns filter value is a readable fromat
export const getFilterValueName = (value, operator, names) => {
    if (operator === 'IN') {
        if (value === '1') {
            return i18n.t('true');
        } else if (value === '0') {
            return i18n.t('false');
        }
    }

    return value
        .split(';')
        .map(val => names[val] || val)
        .join(', ');
};

// Combine data items into one array and exclude certain value types
export const combineDataItems = (
    dataItemsA = [],
    dataItemsB = [],
    includeTypes,
    excludeTypes
) =>
    sortBy(
        'name',
        [...dataItemsA, ...dataItemsB].filter(
            item =>
                (!includeTypes || includeTypes.includes(item.valueType)) &&
                (!excludeTypes || !excludeTypes.includes(item.valueType))
        )
    );

// TODO: This is VERY expensive because metaData.items can have 100000+ elements.  Consider removing.
// Builds an object with key/names pairs from an API response
export const getApiResponseNames = ({ metaData, headers }) => ({
    ...Object.keys(metaData.items).reduce(
        (names, key) => ({
            ...names,
            [key]: metaData.items[key].name,
        }),
        {}
    ),
    ...headers.reduce(
        (names, header) => ({
            ...names,
            [header.name]: header.column,
        }),
        {}
    ),
    true: i18n.t('Yes'),
    false: i18n.t('No'),
});

// Returns the rendering strategy used
export const getRenderingStrategy = ({ mapViews }) => {
    if (Array.isArray(mapViews)) {
        if (
            mapViews.some(
                view => view.renderingStrategy === RENDERING_STRATEGY_TIMELINE
            )
        ) {
            return 'timeline';
        } else if (
            mapViews.some(
                view =>
                    view.renderingStrategy ===
                    RENDERING_STRATEGY_SPLIT_BY_PERIOD
            )
        ) {
            return 'split-by-period';
        }
    }
    return 'single';
};
