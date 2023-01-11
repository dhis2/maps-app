import { useUserSettings } from '../components/UserSettingsProvider.js'

const useDisplayProperty = () => {
    const { keyAnalysisDisplayProperty } = useUserSettings()
    return keyAnalysisDisplayProperty
}

export default useDisplayProperty
