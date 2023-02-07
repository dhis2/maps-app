import PropTypes from 'prop-types'
import { useEffect } from 'react'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'

const OrgUnitLoader = ({ config, onLoad }) => {
    useEffect(() => {
        orgUnitLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

OrgUnitLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default OrgUnitLoader
