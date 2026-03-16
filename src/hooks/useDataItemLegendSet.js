import { useDataEngine } from '@dhis2/app-runtime'
import { useCallback } from 'react'

const TYPE_TO_RESOURCE = {
    INDICATOR: { resource: 'indicators', getUid: (id) => id },
    DATA_ELEMENT: { resource: 'dataElements', getUid: (id) => id },
    DATA_SET: { resource: 'dataSets', getUid: (id) => id },
    REPORTING_RATE: { resource: 'dataSets', getUid: (id) => id.split('.')[0] },
    PROGRAM_ATTRIBUTE: {
        resource: 'trackedEntityAttributes',
        getUid: (id) => id.split('.')[1],
    },
    PROGRAM_DATA_ELEMENT: {
        resource: 'dataElements',
        getUid: (id) => id.split('.')[1],
    },
    PROGRAM_ATTRIBUTE_OPTION: null,
    PROGRAM_DATA_ELEMENT_OPTION: null,
    PROGRAM_INDICATOR: { resource: 'programIndicators', getUid: (id) => id },
    EXPRESSION_DIMENSION_ITEM: null,
}

const useDataItemLegendSet = () => {
    const engine = useDataEngine()

    const fetchLegendSet = useCallback(
        async (item) => {
            const conf = TYPE_TO_RESOURCE[item.type]
            if (!conf || !item.id) {
                return null
            }

            const uid = conf.getUid(item.id)
            if (!uid) {
                return null
            }

            try {
                const result = await engine.query({
                    legendSet: {
                        resource: `${conf.resource}/${uid}`,
                        params: { fields: 'legendSet' },
                    },
                })
                return result.legendSet?.legendSet ?? null
            } catch {
                return null
            }
        },
        [engine]
    )

    return fetchLegendSet
}

export default useDataItemLegendSet
