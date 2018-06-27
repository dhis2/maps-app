import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import D2FileMenu from '@dhis2/d2-ui-file-menu';
import { newMap } from '../../actions/map';
import { loadFavorite } from '../../actions/favorites';
import { saveFavorite, saveNewFavorite } from '../../actions/favorites';
import './FileMenu.css';

export const FileMenu = (
    { id, newMap, loadFavorite, saveFavorite, saveNewFavorite },
    { d2 }
) => (
    <D2FileMenu
        d2={d2}
        fileType="map"
        fileId={id}
        onNew={newMap}
        onOpen={loadFavorite}
        onSave={saveFavorite}
        onSaveAs={saveNewFavorite}
        onRename={console.log}
        onDelete={newMap}
        onError={error => console.log('error', error)}
    />
);

FileMenu.contextTypes = {
    d2: PropTypes.object,
};

export default connect(
    state => ({
        id: state.map ? state.map.id : null,
    }),
    { newMap, loadFavorite, saveFavorite, saveNewFavorite }
)(FileMenu);
