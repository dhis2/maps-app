import { useConfig } from '@dhis2/app-runtime'

export const BaseUrlShim = ({ children }) => {
    const { baseUrl, apiVersion } = useConfig()

    return children({ baseUrl: `${baseUrl}/api/${apiVersion}` })
}
