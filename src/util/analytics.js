import i18n from '@dhis2/d2-i18n';
import { sortBy, negate } from 'lodash/fp';
import { isValidUid } from 'd2/uid';
import { periodNames } from '../constants/periods';
import { dimConf } from '../constants/dimension';

const FIXED_DIMENSIONS = ['dx', 'ou', 'pe'];

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

export const getPeriodNameFromId = id => i18n.t(periodNames[id]);

export const setFiltersFromPeriod = period => [
    createDimension('pe', [{ ...period }]),
];

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
    if (!value.indexOf(';') >= 0) {
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
                (!includeTypes || includeTypes.indexOf(item.valueType) >= 0) &&
                (!excludeTypes || !(excludeTypes.indexOf(item.valueType) >= 0))
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

// Returns the data items of the first dx dimension in an analytical object
export const getDataDimensionsFromAnalyticalObject = ao => {
    const { columns, rows, filters } = ao;

    // TODO: Should filters be included?
    const dataDim = [...columns, ...rows, ...filters].find(
        i => i.dimension === 'dx'
    );

    // We only use the first dx dimension
    return dataDim ? dataDim.items : [];
};

// Checks if anaytical object is valid as a map layer
// TODO
export const isValidAnalyticalObject = ao => {
    const { columns, rows, filters } = ao;
    const dimensions = [...columns, ...rows, ...filters];

    const dataItems = dimensions.filter(i => i.dimension === 'dx');

    const orgUnits = dimensions.filter(i => i.dimension === 'ou');
    const periods = dimensions.filter(i => i.dimension === 'pe');
    const dynamic = dimensions.filter(
        i => !FIXED_DIMENSIONS.includes(i.dimension)
    );

    let isValid = true;

    if (dataItems.length !== 1 || dataItems[0].items.length !== 1) {
        isValid = false;
    }

    return isValid;
};

// Returns a thematic layer config from an analytical object
export const getThematicLayerFromAnalyticalObject = (ao, dataId) => {
    const { columns, rows, filters, yearlySeries, aggregationType } = ao;
    const dimensions = [...columns, ...rows, ...filters];
    const dataDims = getDataDimensionsFromAnalyticalObject(ao);
    const orgUnits = dimensions.find(i => i.dimension === 'ou');
    let period = dimensions.find(i => i.dimension === 'pe');
    let dataDim = dataDims[0];

    if (dataId) {
        dataDim = dataDims.find(item => item.id === dataId);
    }

    // Currently we only support one period in map filters so we select the first
    if (yearlySeries && yearlySeries.length) {
        period = {
            dimension: 'pe',
            items: [
                {
                    id: yearlySeries[0],
                    name: getPeriodNameFromId(yearlySeries[0]),
                },
            ],
        };
    }

    return {
        layer: 'thematic',
        columns: [{ dimension: 'dx', items: [dataDim] }],
        rows: [orgUnits],
        filters: [period],
        aggregationType,
    };
};

export const getAnalyticalObjectFromThematicLayer = layer => {
    const { columns, rows, filters, aggregationType } = layer;

    return {
        columns,
        rows,
        filters,
        aggregationType,
    };
};
