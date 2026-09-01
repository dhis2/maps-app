import { useDataEngine } from '@dhis2/app-runtime'
import { useCallback } from 'react'

const TYPE_TO_RESOURCE = {
    INDICATOR: { resource: 'indicators', getUid: (id) => id },
    DATA_ELEMENT: {
        resource: 'dataElements',
        getUid: (id) => id,
        hasAggregationType: true,
    },
    DATA_SET: { resource: 'dataSets', getUid: (id) => id },
    REPORTING_RATE: { resource: 'dataSets', getUid: (id) => id.split('.')[0] },
    PROGRAM_ATTRIBUTE: {
        resource: 'trackedEntityAttributes',
        getUid: (id) => id.split('.')[1],
        hasAggregationType: true,
    },
    PROGRAM_DATA_ELEMENT: {
        resource: 'dataElements',
        getUid: (id) => id.split('.')[1],
        hasAggregationType: true,
    },
    PROGRAM_ATTRIBUTE_OPTION: null,
    PROGRAM_DATA_ELEMENT_OPTION: null,
    PROGRAM_INDICATOR: {
        resource: 'programIndicators',
        getUid: (id) => id,
        hasAggregationType: true,
    },
    EXPRESSION_DIMENSION_ITEM: null,
}

const EMPTY_METADATA = { legendSet: null, aggregationType: null }

const useDataItemMetadata = () => {
    const engine = useDataEngine()

    const fetchDataItemMetadata = useCallback(
        async (item) => {
            const conf = TYPE_TO_RESOURCE[item.type]
            if (!conf || !item.id) {
                return EMPTY_METADATA
            }

            const uid = conf.getUid(item.id)
            if (!uid) {
                return EMPTY_METADATA
            }

            const fields = conf.hasAggregationType
                ? 'legendSet,aggregationType'
                : 'legendSet'

            try {
                const result = await engine.query({
                    dataItem: {
                        resource: `${conf.resource}/${uid}`,
                        params: { fields },
                    },
                })
                return {
                    legendSet: result.dataItem.legendSet ?? null,
                    aggregationType: result.dataItem.aggregationType ?? null,
                }
            } catch {
                return EMPTY_METADATA
            }
        },
        [engine]
    )

    return fetchDataItemMetadata
}

export default useDataItemMetadata
