import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { fetchOrgUnitGroupSet } from '../util/orgUnits';
import { getDisplayProperty } from '../util/helpers';
import { getOrgUnitsFromRows } from '../util/analytics';
import { filterPointFacilities, getStyledOrgUnits } from '../util/orgUnits';

const facilityLoader = async config => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const includeGroupSets = !!groupSet;
    const alerts = [];
    let orgUnitParams = orgUnits.map(item => item.id);

    const d2 = await getD2();
    const displayProperty = getDisplayProperty(d2).toUpperCase();
    const { contextPath } = d2.system.systemInfo;

    const requests = [
        d2.geoFeatures
            .byOrgUnit(orgUnitParams)
            .displayProperty(displayProperty)
            .getAll({
                includeGroupSets,
            })
            .then(filterPointFacilities)
            .then(toGeoJson)
            .catch(error => {
                if (error && error.message) {
                    alerts.push({
                        critical: true,
                        message: `${i18n.t('Error')}: ${error.message}`,
                    });
                }
            }),
    ];

    // Load organisationUnitGroups if not passed
    if (includeGroupSets && !groupSet.organisationUnitGroups) {
        requests.push(fetchOrgUnitGroupSet(groupSet.id));
    }

    const [features, organisationUnitGroups] = await Promise.all(requests);

    if (organisationUnitGroups) {
        groupSet.organisationUnitGroups = organisationUnitGroups;
    }

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        contextPath
    );

    if (areaRadius) {
        legend.explanation = [`${areaRadius} ${'m'} ${'buffer'}`];
    }

    if (!styledFeatures.length) {
        alerts.push({ warning: true, message: i18n.t('No facilities found') });
    }

    return {
        ...config,
        data: styledFeatures,
        name: i18n.t('Facilities'),
        legend,
        alerts,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

export default facilityLoader;
