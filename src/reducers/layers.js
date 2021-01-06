import i18n from '@dhis2/d2-i18n';
import * as types from '../constants/actionTypes';
import { earthEngineLayers } from '../constants/earthEngine';

const defaultLayers = () => [
    {
        layer: 'thematic',
        type: i18n.t('Thematic'),
        img: 'images/thematic.png',
        opacity: 0.9,
    },
    {
        layer: 'event',
        type: i18n.t('Events'),
        img: 'images/events.png',
        opacity: 0.8,
        eventClustering: true,
    },
    {
        layer: 'trackedEntity',
        type: i18n.t('Tracked entities'),
        img: 'images/trackedentities.png',
        opacity: 0.5,
    },
    {
        layer: 'facility',
        type: i18n.t('Facilities'),
        img: 'images/facilities.png',
        opacity: 1,
    },
    {
        layer: 'boundary',
        type: i18n.t('Boundaries'),
        img: 'images/boundaries.png',
        opacity: 1,
    },
    ...earthEngineLayers(),
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
