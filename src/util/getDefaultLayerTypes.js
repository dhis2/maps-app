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
        description: i18n.t(
            'Org units shaded or sized by an aggregate data value.'
        ),
        img: 'images/thematic.png',
        opacity: 0.9,
    },
    {
        layer: EVENT_LAYER,
        type: i18n.t('Events'),
        description: i18n.t(
            'Event data collected by a program, plotted at its location.'
        ),
        img: 'images/events.png',
        opacity: 0.8,
        eventClustering: true,
    },
    {
        layer: TRACKED_ENTITY_LAYER,
        type: i18n.t('Tracked entities'),
        description: i18n.t(
            'Tracked entities enrolled in a program, plotted at their location.'
        ),
        img: 'images/trackedentities.png',
        opacity: 0.5,
    },
    {
        layer: FACILITY_LAYER,
        type: i18n.t('Facilities'),
        description: i18n.t('Health facilities plotted at their location.'),
        img: 'images/facilities.png',
        opacity: 1,
    },
    {
        layer: ORG_UNIT_LAYER,
        type: i18n.t('Org units'),
        description: i18n.t('Organisation unit boundaries or locations.'),
        img: 'images/orgunits.png',
        opacity: 1,
    },
]
