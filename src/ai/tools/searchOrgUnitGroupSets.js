/**
 * @param {Object} engine - @dhis2/app-runtime data engine
 * @returns {(args: {query: string}) => Promise<Object>}
 */
export const makeSearchOrgUnitGroupSets =
    (engine) =>
    async ({ query }) => {
        const { groupSets } = await engine.query({
            groupSets: {
                resource: 'organisationUnitGroupSets',
                params: {
                    filter: `displayName:ilike:${query}`,
                    fields: 'id,displayName',
                    pageSize: 10,
                },
            },
        })

        const items = groupSets?.organisationUnitGroupSets ?? []

        if (items.length === 0) {
            return {
                found: false,
                message: `No org unit group sets found matching "${query}".`,
                candidates: [],
            }
        }

        return {
            found: true,
            candidates: items.map(({ id, displayName }) => ({
                id,
                displayName,
            })),
            message:
                items.length === 1
                    ? `Found: ${items[0].displayName} (id: ${items[0].id})`
                    : `Found ${items.length} matches.`,
        }
    }
