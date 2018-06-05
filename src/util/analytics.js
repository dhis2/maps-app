import i18n from '@dhis2/d2-i18n';
import sortBy from 'lodash/fp/sortBy';
import negate from 'lodash/fp/negate';
import { isValidUid } from 'd2/lib/uid';
import { relativePeriods } from '../constants/periods';
import { dimConf } from '../constants/dimension';

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

export const addUserOrgUnitsToRows = (rows = [], userOrgUnits = []) => [
    createDimension('ou', [
        ...getOrgUnitsFromRows(rows).filter(negate(isUserOrgUnit)),
        ...userOrgUnits.map(createUserOrgUnit),
    ]),
];

/* PERIODS */

export const getPeriodFromFilters = (filters = []) =>
    getDimensionItems('pe', filters)[0];

export const getPeriodNameFromId = id => {
    const period = relativePeriods.filter(period => period.id === id)[0];
    return period ? i18n.t(period.name) : null;
};

export const setFiltersFromPeriod = period => [
    createDimension('pe', [{ ...period }]),
];

export const getFiltersFromColumns = (columns = []) => {
    const filters = columns.filter(item => item.filter);
    return filters.length ? filters : null;
};

export const getFiltersAsText = (filters = [], names = {}) => {
    return filters.map(({ name, filter }) => {
        const [operator, value] = filter.split(':');
        return `${name} ${getFilterOperatorAsText(
            operator
        )} [${getFilterValueName(value, names)}]`;
    });
};

// TODO: Cache?
export const getFilterOperatorAsText = id =>
    ({
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
    }[id]);

export const getFilterValueName = (value, names) =>
    value
        .split(';')
        .map(val => names[val] || val)
        .join(', ');

// Combine data items into one array and exclude certain value types
export const combineDataItems = (
    dataItemsA = [],
    dataItemsB = [],
    excludeTypes = []
) =>
    sortBy(
        'name',
        [...dataItemsA, ...dataItemsB].filter(
            item => !excludeTypes.includes(item.valueType)
        )
    );

// Some favorites have emtpy items in dx dimension
export const removeEmptyItems = items => {
    return items.filter(
        item => !item.items || (item.items && item.items.length)
    );
};

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
