import i18n from '@dhis2/d2-i18n';
import * as types from '../constants/actionTypes';
import {
    THEMATIC_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
} from '../constants/layers';
import { earthEngineLayers } from '../constants/earthEngine';

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
    ...earthEngineLayers().filter(l => !l.legacy),
];

const layers = (state, action) => {
    const prevState = state || defaultLayers();

    switch (action.type) {
        case types.EXTERNAL_LAYER_ADD:
            return [
                ...prevState,
                {
                    ...action.payload,
                    isVisible: true,
                },
            ];

        case types.EXTERNAL_LAYER_REMOVE:
            return prevState.filter(layer => layer.id !== action.id);

        default:
            return prevState;
    }
};

export default layers;
