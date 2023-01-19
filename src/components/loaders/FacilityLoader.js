import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import useGeoFeatures from '../../hooks/useGeoFeatures.js'
import useGroupSet from '../../hooks/useOrgUnitGroupSet.js'
import { getOrgUnitsFromRows } from '../../util/analytics.js'
// import facilityLoader from '../../loaders/facilityLoader.js'
import { getStyledOrgUnits } from '../../util/orgUnits.js'

const isPoint = (f) => f.geometry.type === 'Point'

const FacilityLoader = ({ config, onLoad }) => {
    const { features, getFeatures } = useGeoFeatures()
    const { groupSet, getGroupSet } = useGroupSet()
    const { rows, organisationUnitGroupSet } = config

    useEffect(() => {
        if (organisationUnitGroupSet) {
            console.log('ABC', organisationUnitGroupSet.id)
            getGroupSet({ id: organisationUnitGroupSet.id })
        }
    }, [organisationUnitGroupSet, getGroupSet])

    useEffect(() => {
        const orgUnits = getOrgUnitsFromRows(rows).map((item) => item.id)

        getFeatures({
            ou: `ou:${orgUnits.join(',')}`,
            includeGroupSets: !!organisationUnitGroupSet,
        })
    }, [rows, organisationUnitGroupSet, getFeatures])

    console.log('groupSet', groupSet)

    useEffect(() => {
        if (features) {
            const groupSet = undefined
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
    }, [features, config, onLoad])

    return null
}

FacilityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default FacilityLoader
