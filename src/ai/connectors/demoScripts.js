/**
 * Scripted tool-call plans for demo mode.
 * Each entry has a label (shown as an example chip), a regex to match user text,
 * and a sequence of tool calls with natural-language arguments (real resolvers run them).
 *
 * removeLabel / removeMatch / removeSteps: shown as a "remove" chip after the layer
 * is added, so the user can demonstrate removing layers too.
 *
 * The real metadata tools + executor run against the live DHIS2 instance —
 * only the LLM "reasoning" step is replaced by this fixed plan.
 */
export const DEMO_SCRIPTS = [
    {
        label: 'Malaria incidence by district, last 12 months',
        match: /malaria.*district|district.*malaria/i,
        removeLabel: 'Remove malaria layer',
        removeMatch: /remove.*malaria/i,
        steps: [
            {
                id: 'demo-1',
                name: 'search_data_items',
                args: { query: 'malaria' },
            },
            {
                id: 'demo-2',
                name: 'resolve_org_units',
                args: { description: 'by district' },
            },
            {
                id: 'demo-3',
                name: 'resolve_periods',
                args: { description: 'last 12 months' },
            },
            {
                id: 'demo-4',
                name: 'add_thematic_layer',
                args: {
                    dataItem: '__RESOLVED_DATA_ITEM__',
                    orgUnits: '__RESOLVED_ORG_UNITS__',
                    periods: '__RESOLVED_PERIODS__',
                    thematicMapType: 'CHOROPLETH',
                },
            },
        ],
        removeSteps: [
            {
                id: 'remove-1',
                name: 'remove_layer',
                args: { namePattern: 'Malaria', confirmed: true },
            },
        ],
    },
    {
        label: 'Health facilities in my organisation units',
        match: /facilit|health\s+post/i,
        removeLabel: 'Remove facilities layer',
        removeMatch: /remove.*facilit/i,
        steps: [
            {
                id: 'demo-1',
                name: 'resolve_org_units',
                args: { description: 'facility level' },
            },
            {
                id: 'demo-2',
                name: 'add_facility_layer',
                args: { orgUnits: '__RESOLVED_ORG_UNITS__' },
            },
        ],
        removeSteps: [
            {
                id: 'remove-1',
                name: 'remove_layer',
                args: { namePattern: 'Facilities', confirmed: true },
            },
        ],
    },
    {
        label: 'Show district boundaries',
        match: /boundar|district.*bound|admin.*bound/i,
        removeLabel: 'Remove district boundaries layer',
        removeMatch: /remove.*boundar|remove.*district/i,
        steps: [
            {
                id: 'demo-1',
                name: 'resolve_org_units',
                args: { description: 'district level' },
            },
            {
                id: 'demo-2',
                name: 'add_org_unit_layer',
                args: { orgUnits: '__RESOLVED_ORG_UNITS__' },
            },
        ],
        removeSteps: [
            {
                id: 'remove-1',
                name: 'remove_layer',
                args: { namePattern: 'Organisation units', confirmed: true },
            },
        ],
    },
    {
        label: 'ANC 1 coverage as bubble map by district last year',
        match: /anc.*bubble|anc.*district.*bubble|bubble.*anc/i,
        removeLabel: 'Remove ANC bubble layer',
        removeMatch: /remove.*anc/i,
        steps: [
            {
                id: 'demo-1',
                name: 'search_data_items',
                args: { query: 'ANC 1 coverage' },
            },
            {
                id: 'demo-2',
                name: 'resolve_org_units',
                args: { description: 'district level' },
            },
            {
                id: 'demo-3',
                name: 'resolve_periods',
                args: { description: 'last year' },
            },
            {
                id: 'demo-4',
                name: 'add_thematic_layer',
                args: {
                    dataItem: '__RESOLVED_DATA_ITEM__',
                    orgUnits: '__RESOLVED_ORG_UNITS__',
                    periods: '__RESOLVED_PERIODS__',
                    thematicMapType: 'BUBBLE',
                },
            },
        ],
        removeSteps: [
            {
                id: 'remove-1',
                name: 'remove_layer',
                args: { namePattern: 'ANC', confirmed: true },
            },
        ],
    },
]

export const DEMO_FALLBACK_MESSAGE =
    'In demo mode, try one of the example prompts below. Connect an AI provider to use free-form input.'
