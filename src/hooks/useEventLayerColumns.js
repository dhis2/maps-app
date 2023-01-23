import { useDataQuery } from '@dhis2/app-runtime'
import { useState, useCallback, useEffect } from 'react'
import { useUserSettings } from '../components/UserSettingsProvider.js'

const PROGRAM_STAGE_DATA_ELEMENTS_QUERY = {
    elements: {
        resource: 'programStages',
        id: ({ id }) => id,
        params: ({ nameProperty }) => ({
            fields: `programStageDataElements[displayInReports,dataElement[id,code,${nameProperty}~rename(name),optionSet]]`,
            paging: false,
        }),
    },
}

const useEventLayerColumns = () => {
    const [format, setFormat] = useState()
    const { nameProperty } = useUserSettings()
    const { data, error, refetch, loading } = useDataQuery(
        PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
        {
            variables: { nameProperty },
            lazy: true,
        }
    )
    const fetchEventColumns = useCallback(
        (layer, format) => {
            setFormat(format)
            refetch({ id: layer.programStage.id })
        },
        [refetch]
    )

    useEffect(() => {
        if (data) {
            const columns = data.elements.programStageDataElements
                .filter((el) => el.displayInReports)
                .map((el) => ({
                    dimension: el.dataElement.id,
                    name: el.dataElement[format],
                }))
            console.log('data', format, columns)
        }
    }, [data, format])

    return {
        layerData: data,
        layerDataError: error,
        loadingLayerData: loading,
        fetchLayerData: refetch,
        fetchEventColumns,
    }
}

export default useEventLayerColumns
