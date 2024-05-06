import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'

const OrgUnitLoader = ({ config, onLoad }) => {
    const { currentUser } = useCachedDataQuery()
    const { baseUrl } = useConfig()
    const nameProperty = currentUser.keyAnalysisDisplayProperty.toUpperCase()
    const engine = useDataEngine()
    useEffect(() => {
        orgUnitLoader({ config, engine, nameProperty, baseUrl }).then(onLoad)
    }, [config, onLoad, engine, nameProperty, baseUrl])

    return null
}

OrgUnitLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default OrgUnitLoader
