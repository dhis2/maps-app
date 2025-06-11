import { useCachedDataQuery } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { useState, useEffect } from 'react'
import { BING_LAYER, AZURE_LAYER, MS_LAYERS } from '../constants/layers.js'

const UNKNOWN_LAYER = 'unknownLayer'
const TOKEN_VALIDATION_URLS = [
    [
        AZURE_LAYER,
        `https://atlas.microsoft.com/map/static/png?api-version=2.0&zoom=1&center=0,0&layer=basic&width=1&height=1&subscription-key=`,
    ],
    [
        BING_LAYER,
        `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=`,
    ],
]

const getKeyType = async (apiKey) => {
    for (const [type, url] of TOKEN_VALIDATION_URLS) {
        try {
            const response = await fetch(`${url}${apiKey}`)
            if (response.ok) {
                return type
            }
        } catch (error) {
            continue
        }
    }

    console.warn(
        i18n.t('The API key provided is not valid for either MS Bing or Azure.')
    )
    return UNKNOWN_LAYER
}

const useCheckKey = () => {
    const { systemSettings } = useCachedDataQuery()
    const apiKey = systemSettings.keyBingMapsApiKey
    const [keyType, setKeyType] = useState(UNKNOWN_LAYER)

    useEffect(() => {
        const checkKeyType = async () => {
            const type = await getKeyType(apiKey)
            setKeyType(type)
        }

        if (apiKey) {
            checkKeyType()
        }
    }, [apiKey])

    return keyType
}

export const useFilteredMSLayers = () => {
    const keyType = useCheckKey()
    const [filteredLayers, setFilteredLayers] = useState(MS_LAYERS)

    useEffect(() => {
        if (keyType !== UNKNOWN_LAYER) {
            const filtered = MS_LAYERS.filter((layer) => layer !== keyType)
            setFilteredLayers(filtered)
        }
    }, [keyType])

    return filteredLayers
}
