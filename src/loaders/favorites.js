import { getInstance as getD2 } from 'd2/lib/d2';
import { apiFetch } from '../util/api';
import { mapFields } from '../util/helpers';

// Fetch favorite
/*
export const fetchFavorite = async (id) => {
    console.log('Still in use?');
    const d2 = await getD2();
    return d2.models.map.get(id, {
        fields: await mapFields(),
    });
};
*/

// Parse favorite (can be removed if we change the format on the server)
/*
export const parseFavorite = ({id, name, basemap, mapViews, user}) => { // TODO: Add support for longitude, latitude, zoom
    const fav = {
        id,
        name,
        user,
        basemap,
    };

    if (Array.isArray(mapViews)) {
        fav.overlays = mapViews.map(view => {
            view.type = view.layer.replace(/\d$/, ''); // Remove thematic number
            view.title = view.name;
            view.isLoaded = false;

            return view;
        });
    }

    return fav;
};
*/