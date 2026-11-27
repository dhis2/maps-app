import { useDataEngine } from '@dhis2/app-runtime'
import log from 'loglevel'
import { useEffect, useMemo, useState } from 'react'
import { useCachedData } from '../components/cachedDataProvider/CachedDataProvider.jsx'
import { fetchOrgUnitPathDetails } from '../util/orgUnits.js'

const EMPTY_MAP = new Map()

const orgUnitNameSessionCache = new Map()

export const __resetOrgUnitNameSessionCacheForTests = () =>
    orgUnitNameSessionCache.clear()

const useOrgUnitAncestorNames = (
    distinctPathValues,
    knownIdToName = EMPTY_MAP
) => {
    const engine = useDataEngine()
    const { nameProperty } = useCachedData()
    const ids = useMemo(
        () => [
            ...new Set(
                distinctPathValues.flatMap((path) =>
                    String(path).split('/').filter(Boolean)
                )
            ),
        ],
        [distinctPathValues]
    )
    const idsKey = ids.join(',')

    const [idToName, setIdToName] = useState(new Map())
    // The ids the names were last settled for: loading until they are the current ones
    const [settledKey, setSettledKey] = useState(null)

    useEffect(() => {
        if (!ids.length) {
            return
        }

        const buildMerged = () => {
            const merged = new Map(knownIdToName)
            ids.forEach((id) => {
                if (!merged.has(id) && orgUnitNameSessionCache.has(id)) {
                    merged.set(id, orgUnitNameSessionCache.get(id))
                }
            })
            return merged
        }

        const idsToFetch = ids.filter(
            (id) => !knownIdToName.has(id) && !orgUnitNameSessionCache.has(id)
        )

        if (!idsToFetch.length) {
            setIdToName(buildMerged())
            setSettledKey(idsKey)
            return
        }

        let cancelled = false
        fetchOrgUnitPathDetails(engine, idsToFetch, nameProperty)
            .then((details) => {
                Object.entries(details).forEach(([id, d]) => {
                    orgUnitNameSessionCache.set(id, d.name)
                })
            })
            .finally(() => {
                if (cancelled) {
                    return
                }
                setIdToName(buildMerged())
                setSettledKey(idsKey)
            })
            .catch(log.error)
        return () => {
            cancelled = true
        }
        // idsKey is the stable, content-based dependency
        // `ids` is a new array identity every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, idsKey, nameProperty, knownIdToName])

    return { idToName, loading: ids.length > 0 && settledKey !== idsKey }
}

export default useOrgUnitAncestorNames
