import { getInstance as getD2 } from 'd2/lib/d2';
import { getOrgUnitsFromRows } from './analytics';

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

const baseFields = [
    'id',
    'user',
    'displayName~rename(name)',
    'longitude',
    'latitude',
    'zoom',
    'basemap',
];

const analysisFields = async () => {
    const d2 = await getD2();
    const namePropertyUrl = await getDisplayPropertyUrl(d2);
    return [
        '*',
        `columns[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${namePropertyUrl}]]`,
        `rows[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${namePropertyUrl}]]`,
        `filters[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,${namePropertyUrl}]]`,
        'organisationUnits[id,path]', // Added to retrieve org unit paths
        'dataDimensionItems',
        `program[id,${namePropertyUrl}]`,
        'programStage[id,displayName~rename(name)]',
        'legendSet[id,displayName~rename(name)]',
        'trackedEntityType[id,displayName~rename(name)]',
        'organisationUnitSelectionMode',
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

// Add path to org unit dimension  - https://jira.dhis2.org/browse/DHIS2-4212
export const addOrgUnitPaths = (mapViews = []) =>
    mapViews.map(
        view =>
            view.rows && view.organisationUnits
                ? {
                      ...view,
                      rows: view.rows.map(dim => ({
                          ...dim,
                          items: dim.items.map(orgUnit => ({
                              ...orgUnit,
                              path: (
                                  view.organisationUnits.find(
                                      ou => ou.id === orgUnit.id
                                  ) || {}
                              ).path,
                          })),
                      })),
                  }
                : view
    );
