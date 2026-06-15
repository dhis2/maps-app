/**
 * JSON Schema declarations for all AI tools.
 * These are what the LLM sees — no implementation details here.
 * Implementations are in the individual tool files.
 */

export const TOOL_SCHEMAS = [
    {
        name: 'search_data_items',
        description:
            'Search for DHIS2 data items (indicators, data elements, etc.) by name. Returns up to 10 candidates with id, displayName, and dimensionItemType. Always call this before add_thematic_layer to resolve a data item name to an id.',
        input_schema: {
            type: 'object',
            required: ['query'],
            properties: {
                query: {
                    type: 'string',
                    description:
                        'Name or partial name of the indicator/data element, e.g. "malaria incidence"',
                },
                dimensionItemType: {
                    type: 'string',
                    enum: [
                        'INDICATOR',
                        'DATA_ELEMENT',
                        'DATA_ELEMENT_OPERAND',
                        'REPORTING_RATE',
                    ],
                    description: 'Optional: filter by type',
                },
            },
        },
    },
    {
        name: 'resolve_org_units',
        description:
            'Resolve a natural-language org unit description to DHIS2 org unit items (ids and/or level/group tokens). Always call this before any add_*_layer tool. Never invent org unit ids.',
        input_schema: {
            type: 'object',
            required: ['description'],
            properties: {
                description: {
                    type: 'string',
                    description:
                        'Natural language description, e.g. "by district", "Northern region", "my facilities", "all chiefdoms"',
                },
                parentId: {
                    type: 'string',
                    description:
                        'Optional: restrict to children of this org unit id',
                },
            },
        },
    },
    {
        name: 'search_org_unit_group_sets',
        description:
            'Search for org unit group sets by name. Returns candidates with id and displayName. Use to resolve "facility type", "ownership", etc. for facility/org-unit layer styling.',
        input_schema: {
            type: 'object',
            required: ['query'],
            properties: {
                query: {
                    type: 'string',
                    description:
                        'Name or partial name, e.g. "facility type", "ownership"',
                },
            },
        },
    },
    {
        name: 'resolve_periods',
        description:
            'Resolve a natural-language period description to DHIS2 relative period ids. Resolved locally — nothing leaves the browser. Returns an array of period id strings.',
        input_schema: {
            type: 'object',
            required: ['description'],
            properties: {
                description: {
                    type: 'string',
                    description:
                        'e.g. "last 12 months", "this year", "last quarter", "last 6 months"',
                },
            },
        },
    },
    {
        name: 'list_layers',
        description:
            'List the current layers on the map. Returns an array of {id, type, summary}. Call this before update_layer or remove_layer.',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'add_thematic_layer',
        description:
            'Add a thematic (choropleth or bubble) layer to the map. Requires resolved data item id, org unit items, and period ids from the search/resolve tools.',
        input_schema: {
            type: 'object',
            required: ['dataItem', 'orgUnits', 'periods'],
            properties: {
                dataItem: {
                    type: 'object',
                    required: ['id', 'dimensionItemType'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        dimensionItemType: {
                            type: 'string',
                            enum: [
                                'INDICATOR',
                                'DATA_ELEMENT',
                                'DATA_ELEMENT_OPERAND',
                                'REPORTING_RATE',
                            ],
                        },
                    },
                },
                orgUnits: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'Array of org unit ids and/or tokens: LEVEL-<n>, OU_GROUP-<id>, USER_ORGUNIT, USER_ORGUNIT_CHILDREN, USER_ORGUNIT_GRANDCHILDREN',
                },
                periods: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'Array of period ids, e.g. ["LAST_12_MONTHS"] or ["2024"]',
                },
                thematicMapType: {
                    type: 'string',
                    enum: ['CHOROPLETH', 'BUBBLE'],
                    default: 'CHOROPLETH',
                },
                method: {
                    type: 'integer',
                    description:
                        'Classification method: 2=equal intervals (default), 3=equal counts, 1=natural breaks',
                    default: 2,
                },
                classes: {
                    type: 'integer',
                    description: 'Number of classification classes (default 5)',
                    default: 5,
                },
            },
        },
    },
    {
        name: 'add_facility_layer',
        description:
            'Add a facility layer showing health facilities as points on the map.',
        input_schema: {
            type: 'object',
            required: ['orgUnits'],
            properties: {
                orgUnits: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'Org unit items — ids and/or tokens. For "my facilities" use USER_ORGUNIT_CHILDREN.',
                },
                organisationUnitGroupSetId: {
                    type: 'string',
                    description:
                        'Optional: group set id for styling facilities by type/ownership etc.',
                },
            },
        },
    },
    {
        name: 'add_org_unit_layer',
        description:
            'Add an org unit layer showing administrative boundaries. Also use for "show the boundaries" requests.',
        input_schema: {
            type: 'object',
            required: ['orgUnits'],
            properties: {
                orgUnits: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                        'Org unit items — ids and/or level tokens like LEVEL-2',
                },
                organisationUnitGroupSetId: {
                    type: 'string',
                    description:
                        'Optional: group set id for colouring boundaries by ownership etc.',
                },
            },
        },
    },
    {
        name: 'update_layer',
        description:
            'Update properties of an existing layer. Call list_layers first to get the layer id.',
        input_schema: {
            type: 'object',
            required: ['layerId', 'changes'],
            properties: {
                layerId: {
                    type: 'string',
                    description: 'Layer id from list_layers',
                },
                changes: {
                    type: 'object',
                    description:
                        'Properties to update. For periods: {periods: ["LAST_6_MONTHS"]}. For type: {thematicMapType: "BUBBLE"}.',
                },
            },
        },
    },
    {
        name: 'remove_layer',
        description:
            'Remove a layer from the map. Call list_layers first to get the layer id. Always confirm with the user before calling this.',
        input_schema: {
            type: 'object',
            required: ['layerId'],
            properties: {
                layerId: {
                    type: 'string',
                    description: 'Layer id from list_layers',
                },
            },
        },
    },
]

/** Subset of tools used for read/list-only intents */
export const READ_TOOLS = TOOL_SCHEMAS.filter((t) =>
    ['list_layers', 'search_data_items', 'resolve_org_units'].includes(t.name)
)

/** Map from tool name to schema */
export const TOOL_SCHEMA_MAP = Object.fromEntries(
    TOOL_SCHEMAS.map((t) => [t.name, t])
)
