import i18n from '@dhis2/d2-i18n'
import {
    THEMATIC_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
} from '../constants/layers.js'

export const getDefaultLayerTypes = () => [
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
        heatIntensity: 0.5,
        heatRadius: 0.5,
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
]
