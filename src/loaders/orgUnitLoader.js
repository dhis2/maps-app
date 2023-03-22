import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getOrgUnitsFromRows } from '../util/analytics';
import { getDisplayProperty } from '../util/helpers';
import {
    fetchOrgUnitGroupSet,
    addAssociatedGeometries,
    getOrgUnitLevels,
    getStyledOrgUnits,
    getCoordinateField,
} from '../util/orgUnits';

const orgUnitLoader = async config => {
    const { rows, organisationUnitGroupSet: groupSet } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const orgUnitParams = orgUnits.map(item => item.id);
    const includeGroupSets = !!groupSet;
    const coordinateField = getCoordinateField(config);

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();
    const { contextPath } = d2.system.systemInfo;
    const name = i18n.t('Organisation units');
    const alerts = [];

    const featuresRequest = d2.geoFeatures
        .byOrgUnit(orgUnitParams)
        .displayProperty(displayProperty);

    let associatedGeometries;

    const requests = [
        featuresRequest
            .getAll({ includeGroupSets })
            .then(toGeoJson)
            .catch(error => {
                if (error && error.message) {
                    alerts.push({
                        critical: true,
                        message: i18n.t('Error: {{message}}', {
                            message: error.message,
                            nsSeparator: ';',
                        }),
                    });
                }
            }),
        getOrgUnitLevels(d2),
    ];

    // Load organisationUnitGroups if not passed
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        requests.push(fetchOrgUnitGroupSet(groupSet.id));
    }

    const [
        mainFeatures = [],
        orgUnitLevels,
        organisationUnitGroups,
    ] = await Promise.all(requests);

    if (!mainFeatures.length && !alerts.length) {
        alerts.push({
            warning: true,
            message: i18n.t('Selected org units: No coordinates found', {
                nsSeparator: ';',
            }),
        });
    }

    if (organisationUnitGroups) {
        groupSet.organisationUnitGroups = organisationUnitGroups;
    }

    if (coordinateField) {
        associatedGeometries = await featuresRequest
            .getAll({
                coordinateField: coordinateField.id,
                includeGroupSets,
            })
            .then(toGeoJson);

        if (!associatedGeometries.length) {
            alerts.push({
                warning: true,
                message: i18n.t('{{name}}: No coordinates found', {
                    name: coordinateField.name,
                    nsSeparator: ';',
                }),
            });
        }
    }

    const features = addAssociatedGeometries(
        mainFeatures,
        associatedGeometries
    );

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        contextPath,
        orgUnitLevels
    );

    legend.title = name;

    return {
        ...config,
        data: styledFeatures,
        name,
        legend,
        alerts,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default orgUnitLoader;
