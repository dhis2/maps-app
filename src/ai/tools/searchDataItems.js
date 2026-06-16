const MAX_RESULTS = 10

// Only aggregate types can be used in thematic layers.
// PROGRAM_INDICATOR / PROGRAM_DATA_ELEMENT are tracker-scoped and not valid here.
const AGGREGATE_TYPES = [
    'INDICATOR',
    'DATA_ELEMENT',
    'EXPRESSION_DIMENSION_ITEM',
]

/**
 * @param {Object} engine - @dhis2/app-runtime data engine
 * @returns {(args: {query: string, dimensionItemType?: string}) => Promise<Object>}
 */
export const makeSearchDataItems =
    (engine) =>
    async ({ query }) => {
        // Always search across all aggregate types — the model can't know the type before searching
        const filters = [
            `displayName:ilike:${query}`,
            `dimensionItemType:in:[${AGGREGATE_TYPES.join(',')}]`,
        ]

        const { dataItems } = await engine.query({
            dataItems: {
                resource: 'dataItems',
                params: {
                    filter: filters,
                    fields: 'id,displayName,dimensionItemType',
                    pageSize: MAX_RESULTS,
                },
            },
        })

        const items = dataItems?.dataItems ?? []

        if (items.length === 0) {
            return {
                found: false,
                message: `No data items found matching "${query}". Try a different search term.`,
                candidates: [],
            }
        }

        return {
            found: true,
            candidates: items.map(
                ({ id, displayName, dimensionItemType: type }) => ({
                    id,
                    displayName,
                    dimensionItemType: type,
                })
            ),
            message:
                items.length === 1
                    ? `Found: ${items[0].displayName}`
                    : `Found ${items.length} matches. Use the most relevant one.`,
        }
    }
