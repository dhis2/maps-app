import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'

const OrgUnitLoader = ({ config, onLoad }) => {
    const engine = useDataEngine()
    useEffect(() => {
        orgUnitLoader(config, engine).then(onLoad)
    }, [config, onLoad, engine])

    return null
}

OrgUnitLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default OrgUnitLoader
