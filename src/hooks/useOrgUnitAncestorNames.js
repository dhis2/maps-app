import { useDataEngine } from '@dhis2/app-runtime'
import { useEffect, useMemo, useState } from 'react'
import { fetchOrgUnitPathDetails } from '../util/orgUnits.js'

// Resolves the distinct ancestor ids across a set of org-unit path values
// (e.g. '/ImspTQPwCqd/O6uvpzGd5pu') to real display names, batched in one
// bulk request. Ids are not human-readable on their own - unlike the date
// tree, an org unit's raw value doesn't self-describe its label. Callers
// (the table cell renderer and OrgUnitGroupFilterInput.jsx) render the raw
// id as a placeholder until `idToName` resolves, rather than blocking.
const useOrgUnitAncestorNames = (distinctPathValues) => {
    const engine = useDataEngine()
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
        let cancelled = false
        setLoading(true)
        fetchOrgUnitPathDetails(engine, ids).then((details) => {
            if (cancelled) {
                return
            }
            setIdToName(
                new Map(Object.entries(details).map(([id, d]) => [id, d.name]))
            )
            setLoading(false)
        })
        return () => {
            cancelled = true
        }
        // idsKey is the stable, content-based dependency - `ids` is a new
        // array identity every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, idsKey])

    return { idToName, loading }
}

export default useOrgUnitAncestorNames
