import { generateUid } from 'd2/lib/uid';

export const createAlert = (title, description) => ({
    id: generateUid(),
    title,
    description,
});

// Returns array of all alerts from map config and layers (mapViews)
export const getMapAlerts = mapConfig =>
    []
        .concat(...(mapConfig && mapConfig.alerts ? mapConfig.alerts : []))
        .concat(
            ...(mapConfig &&
                mapConfig.mapViews &&
                mapConfig.mapViews
                    .filter(layer => layer.alerts)
                    .map(layer => layer.alerts))
        );