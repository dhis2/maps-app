import i18n from '@dhis2/d2-i18n'
import essentialTags from '../components/osmImport/essentialTags.json'
import {
    OSM_DATA_ELEMENTS as DE,
    OSM_PROGRAMS,
} from '../components/osmImport/osmMetadata.js'

// Categories and subcategories come from essentialTags.json, in the format
// "use:<category>" → "type:<elements>" → "key:<key>" → "cat:<subcategory>"
// → values. A copy of maps-tools/osm-essential-tags/essential-tags-v1.json.

// Add layer list entry that opens the OSM import
export const OSM_IMPORT_SOURCE = 'osmImport'

export const OSM_GEOMETRY_POINT = 'point'
export const OSM_GEOMETRY_LINE = 'line'

// Names, map colours and anything the tags don't say, by category id
const getCategoryConfig = () => ({
    health_facilities: {
        name: i18n.t('Health facilities'),
        color: '#1b9e77',
        typeDataElement: DE.facilityType,
    },
    education: { name: i18n.t('Education'), color: '#7570b3' },
    water_sanitation: {
        name: i18n.t('Water and sanitation'),
        color: '#1f78b4',
    },
    humanitarian: { name: i18n.t('Humanitarian'), color: '#e7298a' },
    public_services: { name: i18n.t('Public services'), color: '#66a61e' },
    cemeteries: { name: i18n.t('Cemeteries'), color: '#666666' },
    settlements: { name: i18n.t('Settlements'), color: '#a6761d' },
    transport_hubs: { name: i18n.t('Transport hubs'), color: '#e6ab02' },
    roads: {
        name: i18n.t('Roads'),
        color: '#d95f02',
        typeDataElement: DE.roadClass,
        surfaceOptions: ['asphalt', 'paved', 'unpaved', 'gravel', 'dirt'],
    },
    waterways: { name: i18n.t('Waterways'), color: '#386cb0' },
})

const getSubcategoryNames = () => ({
    hospitals: i18n.t('Hospitals'),
    clinics: i18n.t('Clinics and health centres'),
    doctors_and_dentists: i18n.t('Doctors and dentists'),
    pharmacies: i18n.t('Pharmacies'),
    maternal_care: i18n.t('Maternal care'),
    other_care: i18n.t('Other care'),
    ambulance_stations: i18n.t('Ambulance stations'),
    kindergartens: i18n.t('Kindergartens'),
    schools: i18n.t('Schools'),
    higher_education: i18n.t('Colleges and universities'),
    drinking_water: i18n.t('Drinking water'),
    water_infrastructure: i18n.t('Water infrastructure'),
    sanitation: i18n.t('Sanitation'),
    refugee_sites: i18n.t('Refugee sites'),
    detention_centres: i18n.t('Detention centres'),
    shelters: i18n.t('Shelters'),
    border_crossings: i18n.t('Border crossings'),
    military: i18n.t('Military'),
    offices: i18n.t('Government and NGO offices'),
    security_and_justice: i18n.t('Security and justice'),
    administration: i18n.t('Administration'),
    markets: i18n.t('Markets'),
    financial: i18n.t('Banks and money'),
    cemeteries: i18n.t('Cemeteries'),
    cities_and_towns: i18n.t('Cities and towns'),
    villages: i18n.t('Villages'),
    hamlets: i18n.t('Hamlets'),
    neighbourhoods: i18n.t('Neighbourhoods'),
    stations: i18n.t('Bus stations and ferry terminals'),
    fuel: i18n.t('Fuel stations'),
    airports: i18n.t('Airports and helipads'),
    motorways: i18n.t('Motorways'),
    trunk: i18n.t('Trunk roads'),
    primary: i18n.t('Primary roads'),
    secondary: i18n.t('Secondary roads'),
    tertiary: i18n.t('Tertiary roads'),
    minor_roads: i18n.t('Minor and residential roads'),
    tracks_and_service: i18n.t('Tracks and service roads'),
    paths: i18n.t('Paths'),
    rivers: i18n.t('Rivers'),
    streams: i18n.t('Streams'),
    canals_and_drains: i18n.t('Canals and drains'),
})

const stripPrefix = (key) => key.slice(key.indexOf(':') + 1)

// For ids added to the JSON without a translated name
const humanize = (id) =>
    id.charAt(0).toUpperCase() + id.slice(1).replaceAll('_', ' ')

// "type:any" → nwr, "type:node,way" → nw, "type:way" → way
const toOverpassElements = (type) => {
    const types = stripPrefix(type).split(',')
    if (types.includes('any') || types.length === 3) {
        return 'nwr'
    }
    if (types.length === 1) {
        return { node: 'node', way: 'way', relation: 'rel' }[types[0]]
    }
    return types.map((t) => t[0]).join('')
}

// Flat list of a category's tags: [{ elements, key, value, subcategory }]
const getTags = (use) =>
    Object.entries(use).flatMap(([type, keys]) =>
        Object.entries(keys).flatMap(([key, subcategories]) =>
            Object.entries(subcategories).flatMap(([subcategory, values]) =>
                values.map((value) => ({
                    elements: toOverpassElements(type),
                    key: stripPrefix(key),
                    value,
                    subcategory: stripPrefix(subcategory),
                }))
            )
        )
    )

const unique = (list) => [...new Set(list)]

// Categories with a program, lines when only ways are queried
export const getOsmCategories = () => {
    const config = getCategoryConfig()
    const subcategoryNames = getSubcategoryNames()

    return Object.entries(essentialTags)
        .map(([key, use]) => {
            const id = stripPrefix(key)
            const tags = getTags(use)
            const isLine = Object.keys(use).every((t) => t === 'type:way')

            return {
                id,
                name: config[id]?.name ?? humanize(id),
                color: config[id]?.color ?? '#333333',
                geometry: isLine ? OSM_GEOMETRY_LINE : OSM_GEOMETRY_POINT,
                program: OSM_PROGRAMS[id],
                typeDataElement: config[id]?.typeDataElement ?? DE.type,
                surfaceOptions: config[id]?.surfaceOptions,
                tags,
                subcategories: unique(tags.map((t) => t.subcategory)).map(
                    (subcategory) => ({
                        id: subcategory,
                        name:
                            subcategoryNames[subcategory] ??
                            humanize(subcategory),
                        values: unique(
                            tags
                                .filter((t) => t.subcategory === subcategory)
                                .map((t) => t.value)
                        ),
                    })
                ),
                typeOptions: unique(tags.map((t) => t.value)),
            }
        })
        .filter((category) => category.program)
}

export const getOsmCategory = (id) =>
    getOsmCategories().find((category) => category.id === id)

export const getOsmCategoryByProgram = (programId) =>
    getOsmCategories().find((category) => category.program.id === programId)

export const getSubcategoryIds = (category) =>
    category.subcategories.map(({ id }) => id)

export const getSubcategoryName = (category, id) =>
    category.subcategories.find((subcategory) => subcategory.id === id)?.name ??
    id

// The first tag of the category the element has, among the subcategories
export const findTag = (category, tags, subcategoryIds) =>
    category.tags.find(
        ({ key, value, subcategory }) =>
            tags?.[key] === value &&
            (!subcategoryIds || subcategoryIds.includes(subcategory))
    )

// The tag for a type picked in the add form
export const getTagForValue = (category, value) =>
    category.tags.find((tag) => tag.value === value)

export const formatTag = ({ key, value }) => `${key}=${value}`

/**
 * Overpass filters for the selected subcategories, one per element type
 * and key, e.g. nwr["amenity"~"^(school|college)$"]
 */
export const getOverpassFilters = (category, subcategoryIds) => {
    const groups = new Map()
    category.tags
        .filter(({ subcategory }) => subcategoryIds.includes(subcategory))
        .forEach(({ elements, key, value }) => {
            const id = `${elements}|${key}`
            const group = groups.get(id) ?? { elements, key, values: [] }
            group.values.push(value)
            groups.set(id, group)
        })

    return [...groups.values()].map(
        ({ elements, key, values }) =>
            `${elements}["${key}"~"^(${unique(values).join('|')})$"]`
    )
}
