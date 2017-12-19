import { apiFetch } from '../util/api';
import { mapFields } from '../util/helpers';

// Fetch favorite
export const fetchFavorite = async (id) => {
    return apiFetch(`/maps/${id}.json?fields=${await mapFields()}`);
};

// Parse favorite (can be removed if we change the format on the server)
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