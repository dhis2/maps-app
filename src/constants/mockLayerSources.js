// PROTOTYPE ONLY - fake external layer sources so the catalog list is worth
// filtering without depending on what the dev instance has configured.
// Delete this file and its two importers (AddLayerPopover, ManageLayerSourcesModal)
// before this becomes real.
import i18n from '@dhis2/d2-i18n'
import { PLACEMENT_BASEMAP } from '../util/layerSources.js'
import {
    EXTERNAL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    VECTOR_STYLE,
} from './layers.js'

const mock = ({ id, name, description, type = TILE_LAYER, url }) => ({
    layer: EXTERNAL_LAYER,
    img: 'images/featurelayer.png',
    name,
    description,
    config: {
        id,
        type,
        name,
        url,
        tms: false,
        format: 'image/png',
    },
})

export const mockLayerSources = () => [
    mock({
        id: 'mockCatchment01',
        name: i18n.t('Health facility catchment areas'),
        description: i18n.t(
            'Modelled catchment polygons for every public health facility, based on a 60 minute walking travel time.'
        ),
        type: WMS_LAYER,
        url: 'https://example.org/geoserver/wms',
    }),
    mock({
        id: 'mockAdmin03',
        name: i18n.t('Administrative boundaries level 3'),
        description: i18n.t(
            'Official chiefdom and ward boundaries published by the national statistics office.'
        ),
        type: WMS_LAYER,
        url: 'https://example.org/geoserver/wms',
    }),
    mock({
        id: 'mockMalaria24',
        name: i18n.t('Malaria risk raster 2024'),
        description: i18n.t(
            'Predicted Plasmodium falciparum prevalence at 1km resolution, Malaria Atlas Project.'
        ),
        url: 'https://example.org/tiles/malaria/{z}/{x}/{y}.png',
    }),
    mock({
        id: 'mockRoads01',
        name: i18n.t('Road network (OpenStreetMap)'),
        description: i18n.t(
            'Primary, secondary and tertiary roads extracted from OpenStreetMap.'
        ),
        url: 'https://example.org/tiles/roads/{z}/{x}/{y}.png',
    }),
    mock({
        id: 'mockRivers01',
        name: i18n.t('Rivers and water bodies'),
        description: i18n.t(
            'Permanent and seasonal surface water, derived from Sentinel-2 imagery.'
        ),
        url: 'https://example.org/tiles/water/{z}/{x}/{y}.png',
    }),
    mock({
        id: 'mockFlood01',
        name: i18n.t('Flood hazard zones'),
        description: i18n.t(
            'Areas with a 1-in-100 year flood return period, modelled by the disaster management agency.'
        ),
        type: WMS_LAYER,
        url: 'https://example.org/geoserver/wms',
    }),
    mock({
        id: 'mockSchools01',
        name: i18n.t('School locations'),
        description: i18n.t(
            'Primary and secondary school points from the education management information system.'
        ),
        url: 'https://example.org/tiles/schools/{z}/{x}/{y}.png',
    }),
    mock({
        id: 'mockPopDensity',
        name: i18n.t('Population density (national census)'),
        description: i18n.t(
            'Census enumeration areas shaded by people per square kilometre.'
        ),
        type: WMS_LAYER,
        url: 'https://example.org/geoserver/wms',
    }),
    mock({
        id: 'mockSatellite24',
        name: i18n.t('Satellite imagery 2024'),
        description: i18n.t('High resolution true colour imagery, dry season.'),
        url: 'https://example.org/tiles/imagery/{z}/{x}/{y}.png',
    }),
    mock({
        id: 'mockMobile01',
        name: i18n.t('Mobile network coverage'),
        description: i18n.t(
            'Reported 3G and 4G coverage footprints from the telecommunications regulator.'
        ),
        url: 'https://example.org/tiles/coverage/{z}/{x}/{y}.png',
    }),
    mock({
        id: 'mockHealthDistricts',
        name: i18n.t('Health districts (proposed 2026)'),
        description: i18n.t(
            'Draft redistricting proposal under consultation - not for official reporting.'
        ),
        type: WMS_LAYER,
        url: 'https://example.org/geoserver/wms',
    }),
    mock({
        id: 'mockClinicRefs',
        name: i18n.t('Referral routes'),
        description: i18n.t(
            'Ambulance referral corridors between health centres and district hospitals.'
        ),
        url: 'https://example.org/tiles/referrals/{z}/{x}/{y}.png',
    }),
]

// Shaped like createExternalBasemapLayer() output, plus the placement tag the
// catalog filters on. No `img`, so they render the "External basemap"
// placeholder tile on the Basemap card, like real external basemaps do.
const mockBasemap = ({ id, name, description, type = TILE_LAYER, url }) => ({
    layer: EXTERNAL_LAYER,
    id,
    name,
    description,
    placement: PLACEMENT_BASEMAP,
    config: {
        id,
        type,
        name,
        url,
        tms: false,
        format: 'image/png',
    },
})

export const mockBasemapSources = () => [
    mockBasemap({
        id: 'mockOrthophoto22',
        name: i18n.t('National orthophoto 2022'),
        description: i18n.t(
            'Aerial imagery flown at 25cm resolution by the national mapping agency.'
        ),
        type: WMS_LAYER,
        url: 'https://example.org/geoserver/wms',
    }),
    mockBasemap({
        id: 'mockDarkMatter',
        name: i18n.t('Dark cartographic base'),
        description: i18n.t(
            'Low contrast dark basemap, intended as a backdrop for bright thematic layers.'
        ),
        url: 'https://example.org/tiles/dark/{z}/{x}/{y}.png',
    }),
    mockBasemap({
        id: 'mockVectorStreets',
        name: i18n.t('Vector streets'),
        description: i18n.t(
            'Vector tile street map with labels in the national languages.'
        ),
        type: VECTOR_STYLE,
        url: 'https://example.org/styles/streets.json',
    }),
]
