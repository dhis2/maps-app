import { useDataEngine } from '@dhis2/app-runtime'
import { useCallback } from 'react'
import { dimConf } from '../constants/dimension.js'

const TYPE_TO_RESOURCE = Object.fromEntries(
    Object.values(dimConf)
        .filter((conf) => conf.itemType && conf.value)
        .map((conf) => [conf.itemType, conf.value])
)

const useDataItemLegendSet = () => {
    const engine = useDataEngine()

    const fetchLegendSet = useCallback(
        async (item) => {
            const resource = TYPE_TO_RESOURCE[item.type]

            if (!resource || !item.id) {
                return null
            }

            try {
                const result = await engine.query({
                    legendSet: {
                        resource: `${resource}/${item.id}`,
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
