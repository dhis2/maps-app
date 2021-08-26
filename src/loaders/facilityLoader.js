import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2';
import { toGeoJson } from '../util/map';
import { getDisplayProperty } from '../util/helpers';
import { getOrgUnitsFromRows } from '../util/analytics';
import { filterPointFacilities, getStyledOrgUnits } from '../util/orgUnits';

const facilityLoader = async config => {
    const { rows, organisationUnitGroupSet: groupSet, areaRadius } = config;
    const orgUnits = getOrgUnitsFromRows(rows);
    const includeGroupSets = !!groupSet;
    let orgUnitParams = orgUnits.map(item => item.id);
    let alert;

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
                    alert = {
                        critical: true,
                        message: `${i18n.t('Error')}: ${error.message}`,
                    };
                }
            }),
    ];

    // TODO: Load organisationUnitGroups if not passed
    /*
    const groupSetReq = d2.models.organisationUnitGroupSet
        .get(groupSetId, {
            fields: `organisationUnitGroups[id,${displayProperty}~rename(name),symbol]`,
        })
        .then(parseGroupSet);
    */

    const [features] = await Promise.all(requests);

    const { styledFeatures, legend } = getStyledOrgUnits(
        features,
        groupSet,
        config,
        contextPath
    );

    if (areaRadius) {
        legend.explanation = [`${areaRadius} ${'m'} ${'buffer'}`];
    }

    return {
        ...config,
        data: styledFeatures,
        name: i18n.t('Facilities'),
        legend,
        alerts: alert ? [alert] : undefined,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

/*
const parseGroupSet = groupSet =>
    groupSet.organisationUnitGroups
        .toArray()
        .reduce((symbols, group, index) => {
            // Easier lookup of unit group symbols
            group.symbol = group.symbol || 21 + index + '.png'; // Default symbol 21-25 are coloured circles
            symbols[group.id] = group;
            return symbols;
        }, {});
*/

export default facilityLoader;
