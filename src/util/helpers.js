import { getInstance as getD2 } from 'd2/lib/d2';

// import store from '../store';
const defaultKeyAnalysisDisplayProperty = 'displayName';

const propertyMap = {
    name: 'name',
    displayName: 'name',
    shortName: 'shortName',
    displayShortName: 'shortName',
};

const displayPropertyMap = {
    name: 'displayName',
    displayName: 'displayName',
    shortName: 'displayShortName',
    displayShortName: 'displayShortName',
};

export const getDisplayProperty = (d2, displayProperty) => {
    const keyAnalysisDisplayProperty =
        d2.currentUser.settings.keyAnalysisDisplayProperty;
    return (
        propertyMap[keyAnalysisDisplayProperty] ||
        propertyMap[displayProperty] ||
        'name'
    ); // TODO: check
};

export const getDisplayPropertyUrl = d2 => {
    // return `${getDisplayProperty(d2)}~rename(name)`; // TODO
    return `displayName~rename(name)`;
};

export const interpretationsFields = [
    'id',
    'user[id,displayName]',
    'created',
    'likes',
    'likedBy[id,displayName]',
    'text',
    'comments[id,text,created,user[id,displayName]]',
];

const baseFields = [
    'id',
    'user[id,displayName]',
    'displayName~rename(name)',
    'description',
    'longitude',
    'latitude',
    'zoom',
    'basemap',
    'created',
    'lastUpdated',
    'publicAccess',
    'userGroupAccesses',
    'access',
    `interpretations[${interpretationsFields.join(',')}]`,
];

const analysisFields = async () => {
    const d2 = await getD2();
    const namePropertyUrl = await getDisplayPropertyUrl(d2);
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
        '!topLimit',
    ];
};

export const mapFields = async () => {
    const fields = await analysisFields();
    return `${baseFields.join(',')}, mapViews[${fields.join(',')}]`;
};

export const legendFields = [
    '*',
    '!created',
    '!lastUpdated',
    '!displayName',
    '!externalAccess',
    '!access',
    '!userGroupAccesses',
];

export const legendSetFields = [
    'id,displayName~rename(name),legends[' + legendFields.join(',') + ']',
];
