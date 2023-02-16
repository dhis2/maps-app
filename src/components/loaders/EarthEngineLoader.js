import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'
import { useUserSettings } from '../UserSettingsProvider.js'

const EarthEngineLoader = ({ config, onLoad }) => {
    const { keyAnalysisDisplayProperty: displayProperty } = useUserSettings()
    const { d2 } = useD2()
    useEffect(() => {
        earthEngineLoader(config, { displayProperty, d2 }).then(onLoad)
    }, [config, onLoad, displayProperty, d2])

    return null
}

EarthEngineLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EarthEngineLoader
