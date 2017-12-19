import { getInstance as getD2 } from 'd2/lib/d2';

// import store from '../store';
const defaultKeyAnalysisDisplayProperty = 'displayName';

const displayPropertyMap = {
    name: 'displayName',
    displayName: 'displayName',
    shortName: 'displayShortName',
    displayShortName: 'displayShortName',
};

export const getDisplayProperty = async (displayProperty) => {
    const d2 = await getD2();
    return displayPropertyMap[displayProperty || d2.currentUser.settings.keyAnalysisDisplayProperty || defaultKeyAnalysisDisplayProperty];
};

export const getDisplayPropertyUrl = async () => {
    const displayProperty = await getDisplayProperty();
    return `${displayProperty}~rename(name)`;
};



const baseFields = [
    'id',
    'user',
    'displayName~rename(name)',
    'longitude',
    'latitude',
    'zoom',
    'basemap'
];

const analysisFields = async () => {
    const namePropertyUrl = await getDisplayPropertyUrl();
    return [
        '*',
        `columns[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${namePropertyUrl}]]`,
        `rows[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${namePropertyUrl}]]`,
        `filters[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${namePropertyUrl}]]`,
        'dataDimensionItems',
        `program[id,${namePropertyUrl}]`,
        'programStage[id,displayName~rename(name)]',
        'legendSet[id,displayName~rename(name)]',
        '!lastUpdated',
        '!href',
        '!created',
        '!publicAccess',
        '!rewindRelativePeriods',
        '!userOrganisationUnit',
        '!userOrganisationUnitChildren',
        '!userOrganisationUnitGrandChildren',
        '!externalAccess',
        '!access',
        '!relativePeriods',
        '!columnDimensions',
        '!rowDimensions',
        '!filterDimensions',
        '!user',
        '!organisationUnitGroups',
        '!itemOrganisationUnitGroups',
        '!userGroupAccesses',
        '!indicators',
        '!dataElements',
        '!dataElementOperands',
        '!dataElementGroups',
        '!dataSets',
        '!periods',
        '!organisationUnitLevels',
        '!organisationUnits',
        '!sortOrder',
        '!topLimit'
    ];
};

export const mapFields = async () => {
    const fields = await analysisFields();
    return [ baseFields.join(','),  `mapViews[${fields.join(',')}]` ];
};

export const legendFields = [
    '*',
    '!created',
    '!lastUpdated',
    '!displayName',
    '!externalAccess',
    '!access',
    '!userGroupAccesses'
];

export const legendSetFields = [
    'id,displayName~rename(name),legends[' + legendFields.join(',') + ']'
];
