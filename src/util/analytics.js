import i18next from 'i18next';
import sortBy from 'lodash/fp/sortBy';
import negate from 'lodash/fp/negate';
import { isValidUid } from 'd2/lib/uid';
import { relativePeriods } from '../constants/periods';
import { dimConf } from '../constants/dimension';

/* DIMENSIONS */

const createDimension = (dimension, items, props) => ({ dimension, items, ...props });

const getDimension = (dimension, arr) => arr.filter(item => item.dimension === dimension)[0];

const getDimensionItems = (dimension, arr) => {
    const dataItems = getDimension(dimension, arr);
    return (dataItems && dataItems.items) ? dataItems.items : [];
};

/* DATA ITEMS */

export const getDataItemsFromColumns = (columns = []) => getDimensionItems('dx', columns);

/* INDICATORS */

export const getIndicatorFromColumns = (columns = []) => {
    // const indicator = columns.filter(item => item.objectName === 'in')[0];
    const indicator = columns.filter(item => item.dimension === 'dx')[0];
    return (indicator && indicator.items) ? indicator.items[0] : null;
};

export const setIndicatorInColumns = (indicator) => [
    createDimension('dx', [{
        id: indicator.id,
        name: indicator.name,
        dimensionItemType: 'INDICATOR',
        legendSet: indicator.legendSet, // TODO: Keep outside of columns?
    }], { objectName: 'in' })
];

/* PROGRAM INDICATORS */

export const getProgramIndicatorFromColumns = (columns = []) => getDimensionItems('pi', columns);

export const setProgramIndicatorInColumns = (programIndicator) => [
    createDimension('dx', [{
        id: programIndicator.id,
        name: programIndicator.name,
        dimensionItemType: 'PROGRAM_INDICATOR',
    }], { objectName: 'pi' })
];

/* REPORTING RATES */

export const getReportingRateFromColumns = (columns = []) => getDimensionItems('ds', columns);

export const setReportingRateInColumns = (dataSetItem) => [
    createDimension('dx', [{
        id: dataSetItem.id,
        name: dataSetItem.name,
        dimensionItemType: 'REPORTING_RATE',
    }], { objectName: 'ds' })
];

/* ORGANISATION UNIT */

export const getOrgUnitsFromRows = (rows = []) => getDimensionItems('ou', rows) || [];

/* ORGANISATION UNIT NODES */

const isOrgUnitNode = (ou) => isValidUid(ou.id);

export const getOrgUnitNodesFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows).filter(isOrgUnitNode);

export const toggleOrgUnitNodeInRows = (rows = [], orgUnit) => {
    const orgUnits = getOrgUnitsFromRows(rows);
    const hasOrgUnit = orgUnits.some(ou => ou.id === orgUnit.id);
    return [
        createDimension('ou',
            hasOrgUnit ? orgUnits.filter(ou => ou.id !== orgUnit.id) : [ ...orgUnits, { ...orgUnit } ]
        )
    ];
};

/* ORGANISATION UNIT LEVELS */

const isOrgUnitLevel = (ou) => ou.id.substring(0, 6) === 'LEVEL-';
const getIdFromOrgUnitLevel = (ou) => ou.id.substring(6);
const createOrgUnitLevel = (id) => ({ id: `LEVEL-${id}` });

export const getOrgUnitLevelsFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows)
        .filter(isOrgUnitLevel)
        .map(getIdFromOrgUnitLevel);

export const addOrgUnitLevelsToRows = (rows = [], levels = []) => [
    createDimension('ou', [
        ...getOrgUnitsFromRows(rows).filter(negate(isOrgUnitLevel)),
        ...levels.map(createOrgUnitLevel),
    ])
];

/* ORGANISATION UNIT GROUPS */

const isOrgUnitGroup = (ou) => ou.id.substring(0, 9) === 'OU_GROUP-';
const getIdFromOrgUnitGroup = (ou) => ou.id.substring(9);
const createOrgUnitGroup = (id) => ({ id: `OU_GROUP-${id}` });

export const getOrgUnitGroupsFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows)
        .filter(isOrgUnitGroup)
        .map(getIdFromOrgUnitGroup);

export const addOrgUnitGroupsToRows = (rows = [], levels = []) => [
    createDimension('ou', [
        ...getOrgUnitsFromRows(rows).filter(negate(isOrgUnitGroup)),
        ...levels.map(createOrgUnitGroup),
    ])
];

/* USER ORGANISATION UNITS */

const isUserOrgUnit = (ou) => ou.id.substring(0, 12) === 'USER_ORGUNIT';
const getIdFromUserOrgUnit = (ou) => ou.id;
const createUserOrgUnit = (id) => ({ id });

export const getUserOrgUnitsFromRows = (rows = []) =>
    getOrgUnitsFromRows(rows)
        .filter(isUserOrgUnit)
        .map(getIdFromUserOrgUnit);

export const addUserOrgUnitsToRows = (rows = [], userOrgUnits = []) => [
    createDimension('ou', [
        ...getOrgUnitsFromRows(rows).filter(negate(isUserOrgUnit)),
        ...userOrgUnits.map(createUserOrgUnit),
    ])
];

/* PERIODS */

export const getPeriodFromFilters = (filters = []) => getDimensionItems('pe', filters)[0];

export const getPeriodNameFromId = (id) => {
    const period = relativePeriods.filter(period => period.id === id)[0];
    return period ? i18next.t(period.name) : null;
};

export const setFiltersFromPeriod = (period) => [
    createDimension('pe', [ { ...period } ])
];

export const getFiltersFromColumns = (columns = []) => {
    const filters = columns.filter(item => item.filter);
    return filters.length ? filters : null;
};

export const getDimensionIndexFromHeaders = (headers, dimension) => {
    if (!Array.isArray(headers) || !dimension) {
        return null;
    }

    const dim = dimConf[dimension];

    if (!dim) {
        return null;
    }

    // TODO: findIndex is not supported by IE, is it transpiled?
    return headers.findIndex(item => item.name === dim.dimensionName);
};

export const getFiltersAsText = (filters = []) => {
    return filters.map(({ name, filter }) => {
        const [ operator, value ] = filter.split(':');
        return `${name} ${getFilterOperatorAsText(operator)} ${value}`;
    });
};

// TODO: Cache?
export const getFilterOperatorAsText = (id) => ({
    'EQ': '=',
    'GT': '>',
    'GE': '>=',
    'LT': '<',
    'LE': '<=',
    'NE': '!=',
    'IN': i18next.t('one of'),
    '!IN': i18next.t('not one of'),
    'LIKE': i18next.t('contains'),
    '!LIKE': i18next.t('doesn\'t contains'),
}[id]);

// Combine data items into one array and exclude certain value types
export const combineDataItems = (dataItemsA = [], dataItemsB = [], excludeTypes = []) =>
    sortBy('name', [ ...dataItemsA, ...dataItemsB ]
        .filter(item => !excludeTypes.includes(item.valueType)));



