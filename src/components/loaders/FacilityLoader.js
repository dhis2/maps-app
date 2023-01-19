import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { getOrgUnitsFromRows } from '../../util/analytics.js'
import { toGeoJson } from '../../util/map.js'
import { parseGroupSet, getStyledOrgUnits } from '../../util/orgUnits.js'

const isPoint = (f) => f.geometry.type === 'Point'

const facilityQuery = {
    features: {
        resource: 'geoFeatures',
        params: ({
            ou,
            includeGroupSets = false,
            displayProperty = 'NAME',
        }) => ({
            ou,
            includeGroupSets,
            displayProperty,
        }),
    },
}

const orgUnitGroupSetQuery = {
    resource: 'organisationUnitGroupSets',
    id: ({ id }) => id,
    params: {
        fields: 'organisationUnitGroups[id,name,color,symbol]',
    },
}

const FacilityLoader = ({ config, onLoad }) => {
    const { rows, organisationUnitGroupSet } = config

    if (organisationUnitGroupSet) {
        facilityQuery.groupSet = orgUnitGroupSetQuery
    }

    const { data, error, loading, refetch } = useDataQuery(facilityQuery, {
        lazy: true,
        // onComplete: console.log,
    })

    useEffect(() => {
        const orgUnits = getOrgUnitsFromRows(rows).map((item) => item.id)

        refetch({
            ou: `ou:${orgUnits.join(',')}`,
            includeGroupSets: !!organisationUnitGroupSet,
            id: organisationUnitGroupSet?.id,
        })
    }, [rows, organisationUnitGroupSet, refetch])

    useEffect(() => {
        if (data) {
            const features = toGeoJson(data.features)
            const groupSet = data.groupSet
                ? parseGroupSet(data.groupSet)
                : undefined
            const contextPath = ''
            const name = i18n.t('Facilities')

            const { styledFeatures, legend } = getStyledOrgUnits(
                features.filter(isPoint),
                groupSet,
                config,
                contextPath
            )

            legend.title = name

            onLoad({
                ...config,
                data: styledFeatures,
                // associatedGeometries,
                name,
                legend,
                // alerts,
                isLoaded: true,
                isExpanded: true,
                isVisible: true,
            })
        }
    }, [data, config, onLoad])

    return null
}

FacilityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default FacilityLoader
