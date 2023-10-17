import i18n from '@dhis2/d2-i18n'
import * as types from '../constants/actionTypes.js'
import { earthEngineLayers } from '../constants/earthEngine.js'
import {
    THEMATIC_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
} from '../constants/layers.js'

const defaultLayers = () => [
    {
        layer: THEMATIC_LAYER,
        type: i18n.t('Thematic'),
        img: 'images/thematic.png',
        opacity: 0.9,
    },
    {
        layer: EVENT_LAYER,
        type: i18n.t('Events'),
        img: 'images/events.png',
        opacity: 0.8,
        eventClustering: true,
    },
    {
        layer: TRACKED_ENTITY_LAYER,
        type: i18n.t('Tracked entities'),
        img: 'images/trackedentities.png',
        opacity: 0.5,
    },
    {
        layer: FACILITY_LAYER,
        type: i18n.t('Facilities'),
        img: 'images/facilities.png',
        opacity: 1,
    },
    {
        layer: ORG_UNIT_LAYER,
        type: i18n.t('Org units'),
        img: 'images/orgunits.png',
        opacity: 1,
    },
    /*
    {
        layer: 'external',
        type: 'Settlement extents',
        opacity: 1,
        config: {
            type: 'featureService',
            name: 'Settlement extents',
            url:
                'https://services3.arcgis.com/BU6Aadhn6tbBEdyk/ArcGIS/rest/services/GRID3_Sierra_Leone_Settlement_Extents/FeatureServer/0',
        },
    },
    */
    {
        external: true,
        layer: 'featureService',
        type: 'Settlement extents',
        name: 'Settlement extents',
        opacity: 1,
        url: 'https://services3.arcgis.com/BU6Aadhn6tbBEdyk/ArcGIS/rest/services/GRID3_Sierra_Leone_Settlement_Extents/FeatureServer/0',
    },
    {
        external: true,
        layer: 'featureService',
        type: 'Feature Service',
        name: 'Thermal Hotspots and Fire Activity',
        opacity: 1,
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USGS_Seismic_Data_v1/FeatureServer/0',
    },
    {
        external: true,
        layer: 'featureService',
        type: 'Feature Service',
        name: 'Recent Earthquakes',
        opacity: 1,
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Satellite_VIIRS_Thermal_Hotspots_and_Fire_Activity/FeatureServer/0',
    },
    ...earthEngineLayers().filter((l) => !l.legacy),
]

const layers = (state, action) => {
    const prevState = state || defaultLayers()

    switch (action.type) {
        case types.EXTERNAL_LAYER_ADD:
            return [
                ...prevState,
                {
                    ...action.payload,
                    isVisible: true,
                },
            ]

        default:
            return prevState
    }
}

export default layers
