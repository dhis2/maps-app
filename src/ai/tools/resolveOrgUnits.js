/**
 * Resolve a natural-language org unit description to DHIS2 org unit items.
 *
 * Handles:
 *   - User tokens: "my org unit", "my facilities", "my children"
 *   - Level references: "by district", "all chiefdoms", "regional level"
 *     → looks up the instance's level list, never hard-codes numbers
 *   - Parent + level: "districts in Northern region"
 *   - Named unit: "Northern region" → resolve id
 *   - Fallback: ask one clarifying question
 */

const USER_TOKEN_PATTERNS = [
    { pattern: /\bmy\s+facilit/i, token: 'USER_ORGUNIT_CHILDREN' },
    { pattern: /\bmy\s+unit/i, token: 'USER_ORGUNIT' },
    { pattern: /\bmy\s+children/i, token: 'USER_ORGUNIT_CHILDREN' },
    { pattern: /\bmy\s+grandchildren/i, token: 'USER_ORGUNIT_GRANDCHILDREN' },
    { pattern: /\bmy\b/i, token: 'USER_ORGUNIT' },
]

const LEVEL_KEYWORDS = [
    'national',
    'region',
    'regional',
    'province',
    'provincial',
    'district',
    'chiefdom',
    'facility',
    'facilities',
    'sub-district',
    'subdistrict',
    'county',
    'ward',
    'village',
    'community',
]

/**
 * @param {Object} engine - @dhis2/app-runtime data engine
 * @returns {(args: {description: string, parentId?: string}) => Promise<Object>}
 */
export const makeResolveOrgUnits =
    (engine) =>
    async ({ description, parentId }) => {
        // 1. Check for user tokens
        for (const { pattern, token } of USER_TOKEN_PATTERNS) {
            if (pattern.test(description)) {
                const items = [token]
                if (parentId) {
                    items.unshift(parentId)
                }
                return { resolved: true, items, description }
            }
        }

        // 2. Fetch the instance's org unit levels for name→level mapping
        const { levels } = await engine.query({
            levels: {
                resource: 'organisationUnitLevels',
                params: { fields: 'id,level,displayName', order: 'level:asc' },
            },
        })

        const levelList = levels?.organisationUnitLevels ?? []

        // 3. Try to match a level keyword
        const matchedLevel = levelList.find((lvl) =>
            description.toLowerCase().includes(lvl.displayName.toLowerCase())
        )

        if (!matchedLevel) {
            // fallback: check generic keywords
            const genericMatch = LEVEL_KEYWORDS.find((kw) =>
                description.toLowerCase().includes(kw)
            )
            if (!genericMatch) {
                // 4. Try resolving as a named org unit
                return resolveNamedOrgUnit(engine, description, parentId)
            }
            // generic keyword but no level match → return candidates
            return {
                resolved: false,
                needsClarification: true,
                message: `I found the keyword "${genericMatch}" but couldn't match it to an administrative level in this DHIS2 instance. Available levels: ${levelList
                    .map((l) => l.displayName)
                    .join(', ')}. Which level did you mean?`,
                levelCandidates: levelList.map((l) => ({
                    id: l.id,
                    level: l.level,
                    displayName: l.displayName,
                    token: `LEVEL-${l.level}`,
                })),
            }
        }

        // Check if description has a named qualifier alongside the level keyword.
        // e.g. "Bo district" → strip "district" and stop words → "Bo" → resolve as specific OU at that level.
        // This avoids returning LEVEL-N for queries like "facilities for Bo district".
        const levelKeyword = matchedLevel.displayName
        const namedPart = description
            .replace(new RegExp(`\\b${levelKeyword}s?\\b`, 'gi'), '')
            .replace(
                /\b(for|in|of|by|the|all|a|an|health|facilit\w*|boundar\w*|show|add|display)\b/gi,
                ''
            )
            .trim()

        if (namedPart && namedPart.split(/\s+/).length <= 3) {
            const namedResult = await resolveNamedOrgUnitAtLevel(engine, {
                description: namedPart,
                level: matchedLevel.level,
                parentId,
            })
            if (namedResult.resolved) {
                return namedResult
            }
        }

        const items = [`LEVEL-${matchedLevel.level}`]
        if (parentId) {
            items.push(parentId)
        } else {
            // Check if user mentioned a parent unit name like "districts in Northern region"
            const parentResult = await tryExtractParent(
                engine,
                description,
                levelList
            )
            if (parentResult) {
                items.push(parentResult)
            }
        }

        return {
            resolved: true,
            items,
            description,
            levelName: matchedLevel.displayName,
        }
    }

const resolveNamedOrgUnit = async (engine, description, parentId) => {
    const { orgUnits } = await engine.query({
        orgUnits: {
            resource: 'organisationUnits',
            params: {
                query: description,
                fields: 'id,displayName,level,path',
                pageSize: 5,
            },
        },
    })

    const units = orgUnits?.organisationUnits ?? []

    if (units.length === 0) {
        return {
            resolved: false,
            needsClarification: true,
            message: `No org unit found matching "${description}". Please check the name or try a different description.`,
            candidates: [],
        }
    }

    // Exact display name match wins regardless of how many results the query returned
    const exact = units.find(
        (u) => u.displayName.toLowerCase() === description.toLowerCase()
    )
    if (exact) {
        const items = [exact.id]
        if (parentId) {
            items.push(parentId)
        }
        return {
            resolved: true,
            items,
            description,
            resolvedName: exact.displayName,
        }
    }

    if (units.length === 1) {
        const items = [units[0].id]
        if (parentId) {
            items.push(parentId)
        }
        return {
            resolved: true,
            items,
            description,
            resolvedName: units[0].displayName,
        }
    }

    return {
        resolved: false,
        needsClarification: true,
        message: `Multiple org units match "${description}". Which one did you mean?`,
        candidates: units.map(({ id, displayName, level }) => ({
            id,
            displayName,
            level,
        })),
    }
}

/** Resolve a named OU filtered to a specific level — avoids ambiguity when "Bo district" matches chiefdoms too. */
const resolveNamedOrgUnitAtLevel = async (
    engine,
    { description, level, parentId }
) => {
    const { orgUnits } = await engine.query({
        orgUnits: {
            resource: 'organisationUnits',
            params: {
                query: description,
                fields: 'id,displayName,level',
                filter: `level:eq:${level}`,
                pageSize: 5,
            },
        },
    })

    const units = orgUnits?.organisationUnits ?? []
    if (units.length === 0) {
        return { resolved: false }
    }

    const exact = units.find(
        (u) => u.displayName.toLowerCase() === description.toLowerCase()
    )
    const best = exact ?? units[0]
    const items = [best.id]
    if (parentId) {
        items.push(parentId)
    }
    return {
        resolved: true,
        items,
        description,
        resolvedName: best.displayName,
    }
}

/** Try to extract a parent org unit from a phrase like "districts in Northern region" */
const tryExtractParent = async (engine, description, levelList) => {
    const inMatch = description.match(/\bin\s+(.+)$/i)
    if (!inMatch) {
        return null
    }

    const parentPhrase = inMatch[1].trim()
    const isLevelName = levelList.some((l) =>
        parentPhrase.toLowerCase().includes(l.displayName.toLowerCase())
    )
    if (isLevelName) {
        return null
    }

    const { orgUnits } = await engine.query({
        orgUnits: {
            resource: 'organisationUnits',
            params: {
                query: parentPhrase,
                fields: 'id,displayName',
                pageSize: 1,
            },
        },
    })

    return orgUnits?.organisationUnits?.[0]?.id ?? null
}
