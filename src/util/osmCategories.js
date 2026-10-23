import i18n from '@dhis2/d2-i18n'
import {
    OSM_DATA_ELEMENTS as DE,
    OSM_HEALTH_FACILITIES_PROGRAM,
    OSM_ROADS_PROGRAM,
} from '../components/osmImport/osmMetadata.js'

export const OSM_GEOMETRY_POINT = 'point'
export const OSM_GEOMETRY_LINE = 'line'

// Mocked categories are listed in the UI but can't be imported
export const getOsmCategories = () => [
    {
        id: 'healthFacilities',
        name: i18n.t('Health facilities'),
        geometry: OSM_GEOMETRY_POINT,
        program: OSM_HEALTH_FACILITIES_PROGRAM,
        filters: [
            'nwr["amenity"~"^(hospital|clinic|doctors)$"]',
            'nwr["healthcare"]',
        ],
        typeTags: ['healthcare', 'amenity'],
        typeDataElement: DE.facilityType,
    },
    {
        id: 'roads',
        name: i18n.t('Roads'),
        geometry: OSM_GEOMETRY_LINE,
        program: OSM_ROADS_PROGRAM,
        filters: ['way["highway"~"^(motorway|trunk|primary|secondary)$"]'],
        typeTags: ['highway'],
        typeDataElement: DE.roadClass,
        note: i18n.t('Major roads only (motorway, trunk, primary, secondary).'),
    },
    {
        id: 'schools',
        name: i18n.t('Schools'),
        mocked: true,
        filters: ['nwr["amenity"="school"]'],
    },
    {
        id: 'graveyards',
        name: i18n.t('Graveyards'),
        mocked: true,
        filters: ['nwr["amenity"="grave_yard"]', 'nwr["landuse"="cemetery"]'],
    },
    {
        id: 'detentionCentres',
        name: i18n.t('Detention centres'),
        mocked: true,
        filters: ['nwr["amenity"="prison"]'],
    },
    {
        id: 'borderCrossings',
        name: i18n.t('Border crossings'),
        mocked: true,
        filters: ['node["barrier"="border_control"]'],
    },
    {
        id: 'refugeeCamps',
        name: i18n.t('Refugee camps'),
        mocked: true,
        filters: ['nwr["amenity"="refugee_site"]'],
    },
    {
        id: 'rivers',
        name: i18n.t('Rivers'),
        mocked: true,
        filters: ['way["waterway"="river"]'],
        note: i18n.t('Would follow the roads model, one event per way.'),
    },
]
