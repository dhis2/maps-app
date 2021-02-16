import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FileMenu as D2FileMenu } from '@dhis2/analytics';
import { newMap, setMapProps } from '../../actions/map';
import { loadFavorite } from '../../actions/favorites';
import { saveFavorite, saveNewFavorite } from '../../actions/favorites';
import { setAlert } from '../../actions/alerts';

export const FileMenu = (
    {
        current,
        newMap,
        setMapProps,
        loadFavorite,
        saveFavorite,
        saveNewFavorite,
        setAlert,
    },
    { d2 }
) => {
    const setError = error => setAlert({ critical: true, message: error });

    return (
        <D2FileMenu
            d2={d2}
            fileType="map"
            fileObject={current}
            onNew={newMap}
            onOpen={loadFavorite}
            onSave={saveFavorite}
            onSaveAs={saveNewFavorite}
            onRename={setMapProps}
            onDelete={newMap}
            onError={setError}
        />
    );
};

FileMenu.propTypes = {
    current: PropTypes.object.isRequired,
    newMap: PropTypes.func.isRequired,
    setMapProps: PropTypes.func.isRequired,
    loadFavorite: PropTypes.func.isRequired,
    saveFavorite: PropTypes.func.isRequired,
    saveNewFavorite: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
};

FileMenu.contextTypes = {
    d2: PropTypes.object,
};

export default connect(
    state => ({
        id: state.map ? state.map.id : null,
        current: state.map,
    }),
    {
        newMap,
        setMapProps,
        loadFavorite,
        saveFavorite,
        saveNewFavorite,
        setAlert,
    }
)(FileMenu);
