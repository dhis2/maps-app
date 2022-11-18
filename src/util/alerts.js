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
        )
        .map(({ success, warning, critical, message }) => ({
            message,
            options: { success, warning, critical },
        }));
