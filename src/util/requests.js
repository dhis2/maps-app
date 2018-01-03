import { getInstance as getD2 } from 'd2/lib/d2';
import { mapFields } from './helpers';

// API requests

// Fetch one favorite
export const mapRequest = async (id) => {
    const d2 = await getD2();

    return d2.models.map.get(id, {
        fields: await mapFields(),
    }).then((config) => ({
        ...config,
        basemap: config.basemap || { id: 'osmLight' }, // Default basemap
        mapViews: config.mapViews.map((view) => ({
            ...view,
            layer: view.layer.replace(/\d$/, ''), // Remove thematic number used in previous versions
        }))
    }));
};

