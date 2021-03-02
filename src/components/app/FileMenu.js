import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FileMenu } from '@dhis2/analytics';
import { newMap, setMapProps } from '../../actions/map';
import { loadFavorite } from '../../actions/favorites';
import { saveFavorite, saveNewFavorite } from '../../actions/favorites';
import { setAlert } from '../../actions/alerts';
import styles from './styles/FileMenu.module.css';

export const FileMenuContainer = (
    {
        map,
        newMap,
        setMapProps,
        loadFavorite,
        saveFavorite,
        saveNewFavorite,
        setAlert,
    },
    { d2 }
) => {
    const setError = ({ message }) => setAlert({ critical: true, message });

    return (
        <div className={styles.fileMenu}>
            <FileMenu
                d2={d2}
                fileType="map"
                fileObject={map}
                onNew={newMap}
                onOpen={loadFavorite}
                onSave={saveFavorite}
                onSaveAs={saveNewFavorite}
                onRename={setMapProps}
                onDelete={newMap}
                onError={setError}
            />
        </div>
    );
};

FileMenuContainer.propTypes = {
    map: PropTypes.object.isRequired,
    newMap: PropTypes.func.isRequired,
    setMapProps: PropTypes.func.isRequired,
    loadFavorite: PropTypes.func.isRequired,
    saveFavorite: PropTypes.func.isRequired,
    saveNewFavorite: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
};

FileMenuContainer.contextTypes = {
    d2: PropTypes.object,
};

export default connect(({ map }) => ({ map }), {
    newMap,
    setMapProps,
    loadFavorite,
    saveFavorite,
    saveNewFavorite,
    setAlert,
})(FileMenuContainer);
