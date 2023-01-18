import PropTypes from 'prop-types'
import { useEffect } from 'react'
import facilityLoader from '../../loaders/facilityLoader.js'

const FacilityLoader = ({ config, onLoad }) => {
    useEffect(() => {
        facilityLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

FacilityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default FacilityLoader
