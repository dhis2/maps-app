import { apiFetch } from '../util/api';
import isArray from 'd2-utilizr/lib/isArray';

// Fetch favorite
export function fetchFavorite(id) {
    const fields = gis.conf.url.mapFields.join(','); // TODO
    return apiFetch(`/maps/${id}.json?fields=${fields}`);
}

// Parse favorite (can be removed if we change the format on the server)
export function parseFavorite({id, name, basemap, mapViews, user}) { // TODO: Add support for longitude, latitude, zoom
    const fav = {
        id,
        name,
        user,
        basemap,
    };

    if (isArray(mapViews)) {
        fav.overlays = mapViews.map(view => {
            view.type = view.layer.replace(/\d$/, ''); // Remove thematic number
            view.title = view.name;
            view.isLoaded = false;

            return view;
        });
    }

    return fav;
}