import { useDataEngine } from '@dhis2/app-runtime'
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
    const [loading, setLoading] = useState(false)

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
            setLoading(false)
            return
        }

        let cancelled = false
        setLoading(true)
        fetchOrgUnitPathDetails(engine, idsToFetch, nameProperty).then(
            (details) => {
                if (cancelled) {
                    return
                }
                Object.entries(details).forEach(([id, d]) => {
                    orgUnitNameSessionCache.set(id, d.name)
                })
                setIdToName(buildMerged())
                setLoading(false)
            }
        )
        return () => {
            cancelled = true
        }
        // idsKey is the stable, content-based dependency
        // `ids` is a new array identity every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, idsKey, nameProperty, knownIdToName])

    return { idToName, loading }
}

export default useOrgUnitAncestorNames
